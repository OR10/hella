<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AppBundle\Model;
use AppBundle\Voter;

class LabelCoordinatorIsAssignedToProject extends Voter\AccessCheck
{
    /**
     * @param Model\User $user
     * @param object     $object
     *
     * @return bool
     */
    public function userHasAccessToObject(Model\User $user, $object): bool
    {
        if (!($object instanceof Model\Project)) {
            throw new \RuntimeException('Project AccessCheck got non Project as object.');
        }

        if ($object->isDeleted() && !$user->hasRole(Model\User::ROLE_ADMIN)) {
            return false;
        }

        return (
            $user->hasRole(Model\User::ROLE_LABEL_COORDINATOR) &&
            $object->getLatestAssignedCoordinatorUserId() === $user->getId()
        );
    }
}
