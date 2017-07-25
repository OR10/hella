<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service\ProjectDeleter as ProjectDeleterService;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use AppBundle\Model;

class ProjectDeleter extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var ProjectDeleterService\Project
     */
    private $projectDeleter;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * ProjectDeleter constructor.
     *
     * @param Facade\Project                $projectFacade
     * @param ProjectDeleterService\Project $projectDeleter
     */
    public function __construct(
        Facade\Project $projectFacade,
        ProjectDeleterService\Project $projectDeleter
    ) {
        $this->projectDeleter = $projectDeleter;
        $this->projectFacade  = $projectFacade;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $project = $this->projectFacade->find($job->getProjectId());

        if ($project->getStatus() !== Model\Project::STATUS_DELETED) {
            $loggerFacade->logString(
                sprintf('Project %s not deleted yet.', $project->getId()),
                \cscntLogPayload::SEVERITY_FATAL
            );
            throw new \RuntimeException(sprintf('Project %s not deleted yet.', $project->getId()));
        }
        if ($project->getDeletedState() !== Model\Project::DELETED_PENDING) {
            $loggerFacade->logString(
                sprintf('Project %s can\'t deleted due wrong state.', $project->getId()),
                \cscntLogPayload::SEVERITY_FATAL
            );
            throw new \RuntimeException(sprintf('Project can\'t deleted due wrong state.'));
        }

        $this->projectDeleter->delete($project);
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\ProjectDeleter;
    }
}
