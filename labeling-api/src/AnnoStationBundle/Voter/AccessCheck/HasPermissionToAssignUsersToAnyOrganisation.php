<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;
use AppBundle\Voter;
use AnnoStationBundle\Service\Authentication;

class HasPermissionToAssignUsersToAnyOrganisation extends Voter\AccessCheck
{
    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    public function __construct(Authentication\UserPermissions $userPermissions)
    {
        $this->userPermissions = $userPermissions;
    }

    /**
     * @param AppBundleModel\User $user
     * @param object              $object
     *
     * @return bool
     */
    public function userHasAccessToObject(AppBundleModel\User $user, $object): bool
    {
        if (!($object instanceof Model\Organisation)) {
            throw new \RuntimeException('Organisation AccessCheck got non Organisation as object.');
        }

        if ($this->userPermissions->hasPermission('canAddUserToAnyOrganisation')) {
            return true;
        }

        return false;
    }
}
