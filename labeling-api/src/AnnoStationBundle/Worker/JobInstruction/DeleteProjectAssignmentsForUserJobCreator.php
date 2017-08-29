<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppBundleFacade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;

class DeleteProjectAssignmentsForUserJobCreator extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * TaskDatabaseSecurityRebuilder constructor.
     *
     * @param Facade\LabelingTask  $labelingTaskFacade
     * @param Facade\Project       $projectFacade
     * @param AppBundleFacade\User $userFacade
     * @param AMQP\FacadeAMQP      $amqpFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        AppBundleFacade\User $userFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->userFacade         = $userFacade;
        $this->amqpFacade         = $amqpFacade;
        $this->projectFacade      = $projectFacade;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $user = $this->userFacade->getUserById($job->getUserId());
        foreach ($job->getProjectIds() as $projectId) {
            $project = $this->projectFacade->find($projectId);
            $taskIds = $this->labelingTaskFacade->getTaskIdsForAssignedUserForProject($project, $user);
            foreach ($taskIds as $taskId) {
                $job = new Jobs\LabelingTaskRemoveAssignment($user->getId(), $taskId);
                $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
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
        return $job instanceof Jobs\DeleteProjectAssignmentsForUserJobCreator;
    }
}
