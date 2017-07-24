<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;

class TaskDatabaseSecurityRebuilder extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $databaseSecurityPermissionService;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * TaskDatabaseSecurityRebuilder constructor.
     *
     * @param Facade\LabelingTask                           $labelingTaskFacade
     * @param Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
    ) {
        $this->databaseSecurityPermissionService = $databaseSecurityPermissionService;
        $this->labelingTaskFacade                = $labelingTaskFacade;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $this->databaseSecurityPermissionService->updateForTask(
            $this->labelingTaskFacade->find(
                $job->getTaskId()
            )
        );
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\TaskDatabaseSecurityRebuilder;
    }
}
