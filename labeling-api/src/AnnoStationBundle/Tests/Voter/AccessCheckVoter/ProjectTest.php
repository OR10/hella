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
        $this->user->removeRole(Model\User::ROLE_LABEL_MANAGER);

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

    public function testAssignedLabelerHasReadAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABELER);

        $assignedLabelManager = $this->createUser('assigned-label-manager');
        $otherLabelManager    = $this->createUser('other-label-Manager');
        $otherUser                = $this->createUser('other-user');

        $this->project->addLabelManagerAssignmentHistory($assignedLabelManager);

        $assignmentLabelingGroup = $this->createLabelingGroup($this->createOrganisation(), $assignedLabelManager, [$this->user]);
        $otherLabelingGroup      = $this->createLabelingGroup($this->createOrganisation(), $otherLabelManager, [$otherUser]);

        $this->project->setLabelingGroupId($assignmentLabelingGroup->getId());

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_READ])
        );
    }

    public function testLabelManagerHasReadAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABEL_MANAGER);

        $assignedLabelManager = $this->createUser('assigned-label-Manager');
        $this->project->addLabelManagerAssignmentHistory($assignedLabelManager);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_READ])
        );
    }

    public function testAssignedLabelerHasWriteAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABELER);

        $assignedLabelManager = $this->createUser('assigned-label-Manager');
        $otherLabelManager    = $this->createUser('other-label-Manager');
        $otherUser                = $this->createUser('other-user');

        $this->project->addLabelManagerAssignmentHistory($assignedLabelManager);

        $assignmentLabelingGroup = $this->createLabelingGroup($this->createOrganisation(), $assignedLabelManager, [$this->user]);
        $otherLabelingGroup      = $this->createLabelingGroup($this->createOrganisation(), $otherLabelManager, [$otherUser]);

        $this->project->setLabelingGroupId($assignmentLabelingGroup->getId());

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->project, [AccessCheckVoter\Project::PROJECT_WRITE])
        );
    }

    public function testLabelManagerHasWriteAccess()
    {
        $this->user->addRole(Model\User::ROLE_LABEL_MANAGER);

        $assignedLabelManager = $this->createUser('assigned-label-Manager');
        $this->project->addLabelManagerAssignmentHistory($assignedLabelManager);

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
