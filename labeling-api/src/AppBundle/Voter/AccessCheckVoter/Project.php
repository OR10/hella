<?php
namespace AppBundle\Voter\AccessCheckVoter;

use AppBundle\Database\Facade;
use AppBundle\Voter\AccessCheck;
use AppBundle\Voter\AccessCheckVoter;
use AppBundle\Model;

class Project extends AccessCheckVoter
{
    const PROJECT_READ = 'project.read';
    const PROJECT_WRITE = 'project.write';

    /**
     * @var AccessCheck[]
     */
    private $checks;

    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade
    ) {
        /*
         * The checks are based on the nature of the user account:
         *
         * - Client: Creator of the Project
         * - LabelCoordinator: Directly assigned to the project
         * - Labeler: Inside a LabelingGroup, which has a LabelCoordinator, which is assigned to the project
         * - Admin: grant access to all projects
         *
         */
        $this->checks = array(
            self::PROJECT_READ => [
                new AccessCheck\ClientIsProjectCreator(),
                new AccessCheck\LabelCoordinatorIsAssignedToProject(),
                new AccessCheck\LabelerIsAssignedToProject($labelingGroupFacade),
                new AccessCheck\HasAdminRole(),
            ],
            self::PROJECT_WRITE => [
                new AccessCheck\ClientIsProjectCreator(),
                new AccessCheck\LabelCoordinatorIsAssignedToProject(),
                new AccessCheck\LabelerIsAssignedToProject($labelingGroupFacade),
                new AccessCheck\HasAdminRole(),
            ],
        );
    }

    /**
     * Provide a full list of all accepted attributes
     *
     * @return string[]
     */
    protected function getAttributes(): array
    {
        return array(
            self::PROJECT_READ,
            self::PROJECT_WRITE,
        );
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
