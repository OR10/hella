<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AppBundle\Model;
use AppBundle\Voter;

class ClientIsProjectCreator extends Voter\AccessCheck
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

        if ($object->isDeleted()) {
            return false;
        }

        return (
            $user->hasRole(Model\User::ROLE_CLIENT) &&
            $object->getUserId() === $user->getId()
        );
    }
}
