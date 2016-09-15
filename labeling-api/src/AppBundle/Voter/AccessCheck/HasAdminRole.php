<?php
namespace AppBundle\Voter\AccessCheck;

use AppBundle\Model;
use AppBundle\Voter;

class HasAdminRole extends Voter\AccessCheck
{
    /**
     * @param Model\User $user
     * @param object     $object
     *
     * @return bool
     */
    public function userHasAccessToObject(Model\User $user, $object): bool
    {
        return $user->hasRole(Model\User::ROLE_ADMIN);
    }
}