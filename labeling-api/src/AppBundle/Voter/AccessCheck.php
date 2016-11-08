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
    abstract public function userHasAccessToObject(Model\User $user, $object): bool;
}
