<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Database\Facade;

/**
 * This service is used by the read only precondition annotation.
 * Depending on the user roles and the task-status the user is in readonly-mode
 *
 */
class TaskReadOnlyDecider
{
    /**
     * @var Facade\User
     */
    private $userFacade;
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * TaskReadOnlyDecider constructor.
     * @param Facade\User         $userFacade
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\User $userFacade, Facade\LabelingTask $labelingTaskFacade)
    {
        $this->userFacade         = $userFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @param Model\User         $user
     * @param Model\LabelingTask $labelingTask
     * @return bool
     */
    public function isTaskReadOnlyForUser(Model\User $user, Model\LabelingTask $labelingTask)
    {
        $phase = $this->labelingTaskFacade->getCurrentPhase($labelingTask);
        $taskStatus = $labelingTask->getStatus($phase);
        if ($labelingTask->getLatestAssignedUserIdForPhase($phase) !== null &&
            ($taskStatus === Model\LabelingTask::STATUS_TODO || $taskStatus === Model\LabelingTask::STATUS_IN_PROGRESS)
        ) {
            return $user !== $this->userFacade->getUserById($labelingTask->getLatestAssignedUserIdForPhase($phase));
        }

        if ($user->hasRole(Model\User::ROLE_ADMIN)) {
            return false;
        }

        if ($user->hasOneRoleOf([Model\User::ROLE_LABELER, Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_CLIENT])) {
            return $taskStatus !== Model\LabelingTask::STATUS_TODO;
        }

        return true;
    }
}
