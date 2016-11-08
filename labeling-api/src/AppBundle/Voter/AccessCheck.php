<?php

namespace AppBundle\Voter;

use AppBundle\Model;

abstract class AccessCheck
{
    /**
     * @param Model\User $user
     * @param object     $object
     *
     * @return bool
     */
    public abstract function userHasAccessToObject(Model\User $user, $object): bool;
}
