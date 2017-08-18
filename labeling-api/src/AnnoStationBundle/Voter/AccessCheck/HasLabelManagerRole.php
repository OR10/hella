<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AppBundle\Model;
use AppBundle\Voter;
use AnnoStationBundle\Service\Authentication;

class HasLabelManagerRole extends Voter\AccessCheck
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

        if ($object->isDeleted() && !$this->userPermissions->hasPermission('canViewDeletedProjects')) {
            return false;
        }

        return $user->hasRole(Model\User::ROLE_LABEL_MANAGER);
    }
}
