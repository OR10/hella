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
        if (!$job instanceof Jobs\Interpolation) {
            throw new \RuntimeException("Invalid job type");
        }

        $labeledThing = $this->labeledThingFacade->find($job->getLabeledThingId());

        if ($labeledThing === null) {
            throw new \RuntimeException("LabeledThing not found");
        }

        // TODO: throw exception if status could not be found? or at least log sth about it?
        $status = $job->getStatusId() !== null
                ? $this->statusFacade->find(Model\Interpolation\Status::class, $job->getStatusId())
                : null;

        $this->interpolationService->interpolateForRange(
            $job->getAlgorithm(),
            $labeledThing,
            $job->getFrameRange(),
            $status
        );
    }
}
