<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool\Job;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Worker\Jobs;

class Interpolation extends WorkerPool\JobInstruction
{
    /**
     * @var Service\Interpolation
     */
    private $interpolationService;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\Status
     */
    private $statusFacade;

    /**
     * @param Service\Interpolation $interpolationService
     * @param Facade\LabeledThing   $labeledThingFacade
     * @param Facade\Status         $statusFacade
     */
    public function __construct(
        Service\Interpolation $interpolationService,
        Facade\LabeledThing $labeledThingFacade,
        Facade\Status $statusFacade
    ) {
        $this->interpolationService = $interpolationService;
        $this->labeledThingFacade   = $labeledThingFacade;
        $this->statusFacade         = $statusFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        /** @var Jobs\Interpolation $job */

        /** @var Model\Interpolation\Status|null $status */
        $status = null;

        try {
            if ($job->getStatusId() !== null) {
                $status = $this->statusFacade->find(Model\Interpolation\Status::class, $job->getStatusId());
            }

            if ($status === null) {
                $logger->logString('Missing status for interpolation job', \cscntLogPayload::SEVERITY_ERROR);
            }

            $labeledThing = $this->labeledThingFacade->find($job->getLabeledThingId());

            if ($labeledThing === null) {
                $message = sprintf('Labeled thing not found with id: %s', $job->getLabeledThingId());
                $logger->logString($message, \cscntLogPayload::SEVERITY_ERROR);

                $this->markErrorStatus($logger, $status, $message);

                return;
            }

            $this->updateStatus($status, Model\Interpolation\Status::RUNNING);
            $this->interpolationService->interpolateForRange(
                $job->getAlgorithm(),
                $labeledThing,
                $job->getFrameRange(),
                $status
            );
            $this->updateStatus($status, Model\Interpolation\Status::SUCCESS);
        } catch (Service\Interpolation\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
            $this->updateStatus($status, Model\Interpolation\Status::ERROR, $exception->getMessage());
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
            $this->updateStatus($status, Model\Interpolation\Status::ERROR, $exception->getMessage());
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
            $this->updateStatus($status, Model\Interpolation\Status::ERROR, $throwable->getMessage());
        }
    }

    /**
     * Update the given `$status`
     *
     * @param Model\Interpolation\Status      $status
     * @param string                          $newState
     * @param string                          $message
     */
    private function updateStatus(Model\Interpolation\Status $status, string $newState, string $message = null)
    {
        $status->setStatus($newState, $message);
        $this->statusFacade->save($status);
    }
}
