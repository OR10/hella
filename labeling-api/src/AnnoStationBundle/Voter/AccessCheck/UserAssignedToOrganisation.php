<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Voter;

class UserAssignedToOrganisation extends Voter\AccessCheck
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

        if (in_array($object->getId(), $user->getOrganisations())) {
            return true;
        }

        return false;
    }
}
