<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Voter;
use AnnoStationBundle\Service\Authentication;

class HasSuperAdminRole extends Voter\AccessCheck
{
    /**
     * @param Model\User $user
     * @param object     $object
     *
     * @return bool
     */
    public function userHasAccessToObject(Model\User $user, $object): bool
    {
        if (!($object instanceof AnnoStationBundleModel\Organisation)) {
            throw new \RuntimeException('Organisation AccessCheck got non Organisation as object.');
        }

        return $user->hasRole(Model\User::ROLE_SUPER_ADMIN);
    }
}
