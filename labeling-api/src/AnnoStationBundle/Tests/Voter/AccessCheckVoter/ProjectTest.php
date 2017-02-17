<?php
namespace AnnoStationBundle\Tests\Voter\AccessCheckVoter;

use AppBundle\Model;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Voter\AccessCheckVoter;
use FOS\UserBundle\Util\UserManipulator;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class ProjectTest extends Tests\CouchDbTestCase
{
    /**
     * @var AccessCheckVoter\Project
     */
    private $voter;

    /**
     * @var TokenInterface
     */
    private $token;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var Model\Project
     */
    private $project;

    protected function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->voter = $this->getAnnostationService('voter.access_check.project');

        $this->user = $this->createUser();
        $this->user->removeRole(Model\User::ROLE_ADMIN);

        $this->token = $this->getMockBuilder(TokenInterface::class)->getMock();
        $this->token->method('getUser')->willReturn($this->user);

        $this->project = Model\Project::create(
            'project-1',
            $this->createOrganisation(),
            $this->user
        );
        $this->project->setUserId('some-client-user-id');
        $this->projectFacade->save($this->project);
    }

    public function testAssignedClientHasReadAccess()
    {
        $this->user->addRole(Model\User::ROLE_CLIENT);
        $this->project->setUserId($this->user->getId());

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_READ])
        );
    }

    public function testAssignedLabelCoordinatorHasReadAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABEL_COORDINATOR);
        $this->project->addCoordinatorAssignmentHistory($this->user);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_READ])
        );
    }

    public function testAssignedLabelerHasReadAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABELER);

        $assignedLabelCoordinator = $this->createUser('assigned-label-coordinator');
        $otherLabelCoordinator    = $this->createUser('other-label-coordinator');
        $otherUser                = $this->createUser('other-user');

        $this->project->addCoordinatorAssignmentHistory($assignedLabelCoordinator);

        $assignmentLabelingGroup = $this->createLabelingGroup($assignedLabelCoordinator, [$this->user]);
        $otherLabelingGroup      = $this->createLabelingGroup($otherLabelCoordinator, [$otherUser]);

        $this->project->setLabelingGroupId($assignmentLabelingGroup->getId());

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_READ])
        );
    }

    public function testAdminHasReadAccess()
    {
        $this->user->addRole(Model\User::ROLE_ADMIN);

        $assignedLabelCoordinator = $this->createUser('assigned-label-coordinator');
        $this->project->addCoordinatorAssignmentHistory($assignedLabelCoordinator);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_READ])
        );
    }

    public function testAssignedClientHasWriteAccess()
    {
        $this->user->addRole(Model\User::ROLE_CLIENT);
        $this->project->setUserId($this->user->getId());

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_WRITE])
        );
    }

    public function testAssignedLabelCoordinatorHasWriteAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABEL_COORDINATOR);
        $this->project->addCoordinatorAssignmentHistory($this->user);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_WRITE])
        );
    }

    public function testAssignedLabelerHasWriteAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABELER);

        $assignedLabelCoordinator = $this->createUser('assigned-label-coordinator');
        $otherLabelCoordinator    = $this->createUser('other-label-coordinator');
        $otherUser                = $this->createUser('other-user');

        $this->project->addCoordinatorAssignmentHistory($assignedLabelCoordinator);

        $assignmentLabelingGroup = $this->createLabelingGroup($assignedLabelCoordinator, [$this->user]);
        $otherLabelingGroup      = $this->createLabelingGroup($otherLabelCoordinator, [$otherUser]);

        $this->project->setLabelingGroupId($assignmentLabelingGroup->getId());

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_WRITE])
        );
    }

    public function testAdminHasWriteAccess()
    {
        $this->user->addRole(Model\User::ROLE_ADMIN);

        $assignedLabelCoordinator = $this->createUser('assigned-label-coordinator');
        $this->project->addCoordinatorAssignmentHistory($assignedLabelCoordinator);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_WRITE])
        );
    }

    public function testSupportsProjectSpecificAttributes()
    {
        $this->assertTrue(
            $this->voter->supportsAttribute(AccessCheckVoter\Project::PROJECT_READ)
        );

        $this->assertTrue(
            $this->voter->supportsAttribute(AccessCheckVoter\Project::PROJECT_WRITE)
        );
    }

    public function testSupportsProjectClass()
    {
        $this->assertTrue(
            $this->voter->supportsClass(Model\Project::class)
        );
    }
}
