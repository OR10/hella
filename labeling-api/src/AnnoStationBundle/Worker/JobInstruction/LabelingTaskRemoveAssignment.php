<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use Doctrine\ODM\CouchDB;


class LabelingTaskRemoveAssignment extends WorkerPoolBundle\JobInstruction
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
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * TaskDatabaseSecurityRebuilder constructor.
     *
     * @param Facade\LabelingTask                           $labelingTaskFacade
     * @param Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
     * @param CouchDB\DocumentManager                       $documentManager
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService,
        CouchDB\DocumentManager $documentManager
    ) {
        $this->databaseSecurityPermissionService = $databaseSecurityPermissionService;
        $this->labelingTaskFacade                = $labelingTaskFacade;
        $this->documentManager                   = $documentManager;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $task = $this->labelingTaskFacade->find($job->getTaskId());
        $this->documentManager->refresh($task);

        $lastAssignedUserId = $task->getLatestAssignedUserIdForPhase($task->getCurrentPhase());

        if ($job->getUserId() !== $lastAssignedUserId) {
            throw new \RuntimeException(
                sprintf(
                    'This task "%s" is assigned to "%s" and not to user "%s".',
                    $task->getId(),
                    $lastAssignedUserId,
                    $job->getUserId()
                )
            );
        }

        $task->addAssignmentHistory($task->getCurrentPhase(), $task->getStatus($task->getCurrentPhase()));
        $this->labelingTaskFacade->save($task);

        $this->databaseSecurityPermissionService->updateForTask($task);
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\LabelingTaskRemoveAssignment;
    }
}
