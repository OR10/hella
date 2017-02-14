<?php
namespace AnnoStationBundle\Voter\AccessCheck;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Voter;

class LabelerIsAssignedToProject extends Voter\AccessCheck
{
    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade
    ) {
        $this->labelingGroupFacade = $labelingGroupFacade;
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

        if ($object->isDeleted() && !$user->hasRole(Model\User::ROLE_ADMIN)) {
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
