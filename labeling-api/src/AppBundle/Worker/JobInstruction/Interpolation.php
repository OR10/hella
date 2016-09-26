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

            if ($job->getLabeledThingId() === '1d92c11d-4c1e-4fce-8d70-1ef8c48d3c7f') {
                throw new \Exception('Interpolation failed for demo');
            }

            $labeledThing = $this->labeledThingFacade->find($job->getLabeledThingId());

            if ($labeledThing === null) {
                $message = sprintf('Labeled thing not found with id: %s', $job->getLabeledThingId());
                $logger->logString($message, \cscntLogPayload::SEVERITY_ERROR);

                $this->markErrorStatus($logger, $status, $message);

                return;
            }

            $this->interpolationService->interpolateForRange(
                $job->getAlgorithm(),
                $labeledThing,
                $job->getFrameRange(),
                $status
            );
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
            $this->markErrorStatus($logger, $status);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
            $this->markErrorStatus($logger, $status);
        }
    }

    /**
     * @param Logger\Facade\LoggerFacade      $logger
     * @param Model\Interpolation\Status|null $status
     * @param string                          $message
     */
    private function markErrorStatus(
        Logger\Facade\LoggerFacade $logger,
        Model\Interpolation\Status $status = null,
        string $message = null
    ) {
        if ($status === null) {
            return;
        }

        try {
            $status->setStatus(Model\Interpolation\Status::ERROR, $message);
            $this->statusFacade->save($status);
        } catch (\Throwable $throwable) {
            $logger->logString('Failed setting error status', \cscntLogPayload::SEVERITY_FATAL);
        }
    }
}
