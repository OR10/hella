<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AppBundle\Model;
use AppBundle\Voter;

class HasObserverRole extends Voter\AccessCheck
{
    /**
     * @param Model\User $user
     * @param object     $object
     *
     * @return bool
     */
    public function userHasAccessToObject(Model\User $user, $object): bool
    {
        if (($object instanceof Model\Project) && $object->isDeleted() && !$user->hasRole(Model\User::ROLE_ADMIN)) {
            return false;
        }

        return $user->hasRole(Model\User::ROLE_OBSERVER);
    }
}
