<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Voter;
use AnnoStationBundle\Service\Authentication;

class LabelerIsAssignedToProject extends Voter\AccessCheck
{
    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    public function __construct(
        Authentication\UserPermissions $userPermissions,
        Facade\LabelingGroup $labelingGroupFacade
    ) {
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->userPermissions     = $userPermissions;
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

        $labelingGroupsOfUser   = $this->labelingGroupFacade->findAllByUser($user);
        $labelingGroupIdsOfUser = array_map(
            function ($labelingGroup) {
                /** @var Model\LabeledThing $labelingGroup */
                return $labelingGroup->getId();
            },
            $labelingGroupsOfUser
        );

        return in_array(
            $object->getLabelingGroupId(),
            $labelingGroupIdsOfUser
        );
    }
}
