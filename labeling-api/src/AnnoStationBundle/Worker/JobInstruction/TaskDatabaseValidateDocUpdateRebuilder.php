<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;

class TaskDatabaseValidateDocUpdateRebuilder extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\TaskDatabaseValidateDocUpdateDocumentService
     */
    private $databaseValidateDocUpdateDocumentService;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreator;

    /**
     * TaskDatabaseSecurityRebuilder constructor.
     *
     * @param Facade\LabelingTask                                  $labelingTaskFacade
     * @param Service\TaskDatabaseValidateDocUpdateDocumentService $databaseValidateDocUpdateDocumentService
     * @param Service\TaskDatabaseCreator                          $taskDatabaseCreator
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Service\TaskDatabaseValidateDocUpdateDocumentService $databaseValidateDocUpdateDocumentService,
        Service\TaskDatabaseCreator $taskDatabaseCreator
    ) {
        $this->labelingTaskFacade                       = $labelingTaskFacade;
        $this->databaseValidateDocUpdateDocumentService = $databaseValidateDocUpdateDocumentService;
        $this->taskDatabaseCreator                      = $taskDatabaseCreator;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $this->databaseValidateDocUpdateDocumentService->updateForDatabase(
            $this->taskDatabaseCreator->getDatabaseName($job->getProjectId(), $job->getTaskId())
        );
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\TaskDatabaseValidateDocUpdateRebuilder;
    }
}