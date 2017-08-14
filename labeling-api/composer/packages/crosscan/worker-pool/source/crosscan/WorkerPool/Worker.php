<?php

namespace crosscan\WorkerPool;

use crosscan\Message;
use crosscan\NewRelic;
use crosscan\WorkerPool\Exception;

class Worker
{
    private $jobSource;
    private $running = false;
    private $logger;
    private $rescheduleManager;

    /**
     * @var \crosscan\NewRelic\Wrapper
     */
    private $newRelicWrapper;

    /**
     * @var JobInstructionFactory
     */
    private $instructionFactory;

    /**
     * @param JobSource                            $jobSource
     * @param JobInstructionFactory                $instructionFactory
     * @param \crosscan\Logger\Facade\LoggerFacade $logger
     * @param RescheduleManager                    $rescheduleManager
     * @param NewRelic\Wrapper                     $newRelicWrapper
     * @param EventHandler                         $eventHandler
     */
    public function __construct(
        JobSource $jobSource,
        JobInstructionFactory $instructionFactory,
        \crosscan\Logger\Facade\LoggerFacade $logger,
        RescheduleManager $rescheduleManager,
        NewRelic\Wrapper $newRelicWrapper,
        EventHandler $eventHandler = null
    ) {
        $this->jobSource          = $jobSource;
        $this->instructionFactory = $instructionFactory;
        $this->logger             = $logger;
        $this->rescheduleManager  = $rescheduleManager;
        $this->newRelicWrapper    = $newRelicWrapper;
        $this->eventHandler       = $eventHandler === null ? new EventHandler\NoOp() : $eventHandler;
    }

    /**
     * @param int $cycles     number of jobs to work on before this method will exit.
     *                        0 means it will work ad inifinitum. defaults to 500
     * @param int $maxSeconds number of seconds to work on before this method will exit.
     *                        The elapsed time is checked *after* a job was fetched and if the elapsed time exceeds
     *                        $maxSeconds, the job will be NACK'ed and the method will exit.
     *                        defaults to 1800 (30 minutes).
     */
    public function work($cycles = 500, $maxSeconds = 1800)
    {
        $this->eventHandler->workerStarted();

        $this->running  = true;
        $cycle          = 0;
        $startTimestamp = time();

        while ($this->running) {
            $this->newRelicWrapper->startTransaction("Crosscan\\WorkerPool\\Worker::work_JobPreparation", true);
            $this->eventHandler->beforeJob();
            $cycle++;
            try {
                $jobDelivery = $this->jobSource->getNext();
            } catch (Exception\UnserializeFailed $e) {
                $this->rescheduleManager->handleUnserializeFailed($e);
                break;
            }

            $this->logger->newGroup();

            if (time() - $startTimestamp > $maxSeconds) {
                $this->logger->logString("Max seconds reached", \cscntLogPayload::SEVERITY_DEBUG);

                if ($jobDelivery !== null) {
                    $this->logger->logString("Abort the job -> NACK", \cscntLogPayload::SEVERITY_DEBUG);
                    $jobDelivery->nack();
                }

                $this->stop();
                break;
            }

            if ($jobDelivery !== null) {

                $this->logger->logString("Trying to get next job", \cscntLogPayload::SEVERITY_DEBUG);
                $job = $jobDelivery->getJob();
                $this->logger->logString(
                    "Got a job of type " . get_class($job) . ". Trying to find its JobInstruction",
                    \cscntLogPayload::SEVERITY_DEBUG
                );

                try {
                    $jobInstruction = $this->findJobInstruction($job);
                    $this->logger->logString("Running the Job", \cscntLogPayload::SEVERITY_DEBUG);

                    $this->checkTtl($job);

                    $this->newRelicWrapper->endTransaction();
                    $this->newRelicWrapper->startTransaction(get_class($jobInstruction), true);
                    $this->newRelicWrapper->addParameter('cscntRequestId', (string) $this->logger->getGroup());

                    $this->eventHandler->jobStart($job);

                    $jobInstruction->run($job, $this->logger);

                    $this->eventHandler->jobFinished($job);

                    $this->newRelicWrapper->endTransaction();

                    $this->logger->logString("Finished the job -> ACK", \cscntLogPayload::SEVERITY_DEBUG);
                    $jobDelivery->ack();

                    $this->resetIdentityMap();
                } catch (\Exception $exception) {

                    $this->eventHandler->jobFailed($job, $exception);

                    if ($exception instanceof Exception\Recoverable
                        || $exception instanceof Exception\TimeOutException
                    ) {
                        $this->newRelicWrapper->endTransaction();
                        $this->logger->logException(
                            $exception,
                            \cscntLogPayload::SEVERITY_INFO
                        );
                    } else {
                        $this->newRelicWrapper->noticeError($exception->getMessage(), $exception);
                        $this->newRelicWrapper->endTransaction();

                        $this->logger->logException(
                            $exception,
                            \cscntLogPayload::SEVERITY_WARNING
                        );
                    }
                    $this->rescheduleManager->handle($job, $jobDelivery, $exception);
                    $this->eventHandler->jobRescheduled($job);
                    $this->stop();
                    return;
                }
            }

            if ($cycles > 0 && $cycle >= $cycles) {
                $this->stop();
            }
        }
    }

    private function resetIdentityMap()
    {
        if (class_exists('ezcPersistentSessionInstance') && \ezcPersistentSessionInstance::get()) {
            if (\ezcPersistentSessionInstance::get()
                instanceof \crosscan\Connect\Vendor\ZetaComponentOverwrites\PersistentSessionIdentityDecorator
            ) {
                \ezcPersistentSessionInstance::get()->identityMap->reset();
            }
        }
    }

    private function checkTtl(Job $job)
    {
        if (!isset($job->createdAt)) {
            $job->createdAt = new \DateTime();
        }

        if (!isset($job->ttl)) {
            $job->ttl = Job::DEFAULT_TTL;
        }

        if ($job->ttl <= 0) {
            return;
        }

        $now  = time();
        $then = $job->createdAt->getTimestamp();

        if ($now - $then > $job->ttl) {
            throw new Exception\TimeOutException();
        }
    }

    public function stop()
    {
        $this->eventHandler->workerStopping();
        $this->logger->logString(
            'Shutdown Requested for worker with pid ' . posix_getpid(),
            \cscntLogPayload::SEVERITY_DEBUG
        );
        $this->running = false;
    }

    protected function findJobInstruction(Job $job)
    {
        return $this->instructionFactory->getInstructionForJob($job);
    }
}
