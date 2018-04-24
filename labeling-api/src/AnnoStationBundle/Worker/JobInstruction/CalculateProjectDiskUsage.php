<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use Doctrine\ODM\CouchDB;

class CalculateProjectDiskUsage extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * ProjectDeleter constructor.
     *
     * @param Facade\Project          $projectFacade
     * @param Facade\Video            $videoFacade
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        CouchDB\DocumentManager $documentManager
    ) {
        $this->projectFacade   = $projectFacade;
        $this->videoFacade     = $videoFacade;
        $this->documentManager = $documentManager;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $this->documentManager->clear();
        $project = $this->projectFacade->find($job->getProjectId());
        if (!$project) {
            //Project and related entities can be deleted
            return;
        }

        $oldSize = $project->getDiskUsageInBytes();
        $newSize = $this->videoFacade->calculateAggregatedeVideoSizeForProject($project);

        if ($oldSize !== $newSize) {
            $project->setDiskUsageInBytes($newSize);
            try {
                $this->projectFacade->save($project);
            } catch (CouchDB\UpdateConflictException $e) {
                $loggerFacade->logException($e, \cscntLogPayload::SEVERITY_ERROR);
            }
        }
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\CalculateProjectDiskSize;
    }
}
