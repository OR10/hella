<?php

namespace AppBundle\Service;

use AppBundle\Model;

class UserReadOnlyMode
{
    /**
     * @param Model\User $user
     * @param Model\LabelingTask $labelingTask
     * @return bool
     */
    public function isTaskReadOnlyForUser(Model\User $user, Model\LabelingTask $labelingTask)
    {
        $labelStatus = $labelingTask->getStatus();

        foreach($user->getRoles() as $role) {
            switch ($role) {
                case 'ROLE_LABELER':
                    if ($labelStatus === 'waiting') {
                        return false;
                    }
                    break;
                case 'ROLE_LABEL_COORDINATOR':
                    if ($labelStatus === 'waiting') {
                        return false;
                    }
                    break;
                case 'ROLE_ADMIN':
                    return false;
            }
        }

        return true;
    }
}