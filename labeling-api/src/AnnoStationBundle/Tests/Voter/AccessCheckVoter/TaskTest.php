<?php
namespace AnnoStationBundle\Tests\Voter\AccessCheckVoter;

use AppBundle\Model;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Voter\AccessCheckVoter;
use FOS\UserBundle\Util\UserManipulator;
use PHPUnit_Framework_MockObject_MockObject;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class TaskTest extends Tests\CouchDbTestCase
{
    /**
     * @var AccessCheckVoter\Task
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

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\User
     */
    private $client;

    /**
     * @var Model\User
     */
    private $labelCoordinator;

    /**
     * @var AccessCheckVoter\Project
     */
    private $projectVoter;

    public function provideRoles()
    {
        return array(
            [Model\User::ROLE_ADMIN],
            [Model\User::ROLE_CLIENT],
            [Model\User::ROLE_LABEL_COORDINATOR],
            [Model\User::ROLE_LABELER],
        );
    }

    public function provideAttributes()
    {
        return array(
            [
                [AccessCheckVoter\Task::TASK_READ],
                [AccessCheckVoter\Project::PROJECT_READ],
            ],
            [
                [AccessCheckVoter\Task::TASK_WRITE],
                [AccessCheckVoter\Project::PROJECT_WRITE],
            ],
            [
                [AccessCheckVoter\Task::TASK_READ, AccessCheckVoter\Task::TASK_WRITE],
                [AccessCheckVoter\Project::PROJECT_READ, AccessCheckVoter\Project::PROJECT_WRITE],
            ],
        );
    }

    protected function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->projectVoter = $this->getMockBuilder(AccessCheckVoter\Project::class)
            ->disableOriginalConstructor()
            ->getMock();
        $this->projectVoter->method('vote')->willReturn(VoterInterface::ACCESS_GRANTED);

        $this->voter = new AccessCheckVoter\Task($this->projectVoter, $this->projectFacade);

        $this->user = $this->createUser();
        $this->user->removeRole(Model\User::ROLE_ADMIN);

        $this->client = $this->createUser('client-1');
        $this->labelCoordinator = $this->createUser('label-coordinator-1');

        $this->token = $this->getMockBuilder(TokenInterface::class)->getMock();
        $this->token->method('getUser')->willReturn($this->user);

        $organisation = $this->createOrganisation();
        $this->video = $this->createVideo($organisation, 'video-1');

        $this->project = Model\Project::create(
            'project-1',
            $organisation,
            $this->user
        );
        $this->project->setUserId($this->client->getId());
        $this->project->addCoordinatorAssignmentHistory($this->labelCoordinator);
        $this->projectFacade->save($this->project);

        $this->task = $this->createTask($this->project, $this->video);
    }

    /**
     * @dataProvider provideRoles
     */
    public function testAssignedUserHasReadAccess($role)
    {
        $this->user->addRole($role);

        $this->task->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            $this->user,
            new \DateTime()
        );
        $this->labelingTaskFacade->save($this->task);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->task, [AccessCheckVoter\Task::TASK_READ])
        );
    }

    /**
     * @dataProvider provideRoles
     */
    public function testNotAssignedUserHasReadAccess($role)
    {
        $this->user->addRole($role);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->task, [AccessCheckVoter\Task::TASK_READ])
        );
    }

    /**
     * @dataProvider provideRoles
     */
    public function testAssignedUserHasWriteAccess($role)
    {
        $this->user->addRole($role);

        $this->task->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            $this->user,
            new \DateTime()
        );
        $this->labelingTaskFacade->save($this->task);

        $this->assertTrue(
            $this->voter->voteOnAttribute($this->token, $this->task, [AccessCheckVoter\Task::TASK_WRITE])
        );
    }

    /**
     * @dataProvider provideRoles
     */
    public function testNotAssignedUserHasNoWriteAccess($role)
    {
        $this->user->addRole($role);

        $this->assertFalse(
            $this->voter->voteOnAttribute($this->token, $this->task, [AccessCheckVoter\Task::TASK_WRITE])
        );
    }

    /**
     * @dataProvider provideAttributes
     *
     * @param $taskAttributes
     * @param $projectAttributes
     */
    public function testProjectVoteIsTriggeredAsPrerequisite($taskAttributes, $projectAttributes)
    {
        $projectVoter = $this->projectVoter;
        /** @var PHPUnit_Framework_MockObject_MockObject $projectVoter */
        $projectVoter
            ->expects($this->once())
            ->method('vote')
            ->with(
                $this->equalTo($this->token),
                $this->equalTo($this->project),
                $this->equalTo($projectAttributes)
            );

        $this->voter->voteOnAttribute($this->token, $this->task, $taskAttributes);
    }

    public function testSupportsTaskSpecificAttributes()
    {
        $this->assertTrue(
            $this->voter->supportsAttribute(AccessCheckVoter\Task::TASK_READ)
        );

        $this->assertTrue(
            $this->voter->supportsAttribute(AccessCheckVoter\Task::TASK_WRITE)
        );
    }

    public function testSupportsLabelingTaskClass()
    {
        $this->assertTrue(
            $this->voter->supportsClass(Model\LabelingTask::class)
        );
    }
}
