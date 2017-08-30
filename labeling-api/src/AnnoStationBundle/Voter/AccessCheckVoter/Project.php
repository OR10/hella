<?php
namespace AnnoStationBundle\Voter\AccessCheckVoter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Voter\AccessCheck;
use AppBundle\Voter;
use AppBundle\Voter\AccessCheckVoter;
use AppBundle\Model;
use AnnoStationBundle\Service\Authentication;

class Project extends Voter\AccessCheckVoter
{
    const PROJECT_READ  = 'project.read';
    const PROJECT_WRITE = 'project.write';

    /**
     * @var Voter\AccessCheck[]
     */
    private $checks;

    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade,
        Authentication\UserPermissions $userPermissions
    ) {
        /*
         * The checks are based on the nature of the user account:
         *
         * - LabelManager: Directly assigned to the project
         * - Labeler: Inside a LabelingGroup, which has a LabelManager, which is assigned to the project
         * - LabelManager: grant access to all projects
         *
         */
        $this->checks = [
            self::PROJECT_READ  => [
                new AccessCheck\LabelManagerIsAssignedToProject($userPermissions),
                new AccessCheck\LabelerIsAssignedToProject($userPermissions, $labelingGroupFacade),
                new AccessCheck\HasSuperAdminRole($userPermissions),
                new AccessCheck\HasLabelManagerRole($userPermissions),
                new AccessCheck\HasExternalCoordinatorRole($userPermissions),
                new AccessCheck\HasObserverRole($userPermissions),
            ],
            self::PROJECT_WRITE => [
                new AccessCheck\LabelManagerIsAssignedToProject($userPermissions),
                new AccessCheck\LabelerIsAssignedToProject($userPermissions, $labelingGroupFacade),
                new AccessCheck\HasSuperAdminRole($userPermissions),
                new AccessCheck\HasExternalCoordinatorRole($userPermissions),
                new AccessCheck\HasLabelManagerRole($userPermissions),
            ],
        ];
    }

    /**
     * Provide a full list of all accepted attributes
     *
     * @return string[]
     */
    protected function getAttributes(): array
    {
        return [
            self::PROJECT_READ,
            self::PROJECT_WRITE,
        ];
    }

    /**
     * Provide the type of the accepted class (object)
     *
     * @return string
     */
    protected function getClass(): string
    {
        return Model\Project::class;
    }

    /**
     * Provide a list of AccessCheck implementation. The first one to return true will stop the evaluation chain.
     *
     * @param string $attribute
     *
     * @return \AppBundle\Voter\AccessCheck[]|array
     */
    protected function getChecks(string $attribute): array
    {
        return $this->checks[$attribute];
    }
}
