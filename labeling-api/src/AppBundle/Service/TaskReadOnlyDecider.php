<?php

namespace AppBundle\Service;

use AppBundle\Model;

/**
 *
 */
class TaskReadOnlyDecider
{
    /**
     * @param Model\User $user
     * @param Model\LabelingTask $labelingTask
     * @return bool
     */
    public function isTaskReadOnlyForUser(Model\User $user, Model\LabelingTask $labelingTask)
    {
        if ($user->hasRole(Model\User::ROLE_ADMIN)) {
            return false;
        }

        if ($user->hasOneRoleOf([Model\User::ROLE_LABELER, Model\User::ROLE_LABEL_COORDINATOR])) {
            return $labelingTask->getStatus() !== Model\LabelingTask::STATUS_WAITING;
        }

        return true;
    }
}