<?php
namespace AppBundle\Tests\Voter\AccessCheckVoter;

use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Voter\AccessCheckVoter;
use FOS\UserBundle\Util\UserManipulator;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
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

    public function provideRoles()
    {
        return array(
            [Model\User::ROLE_ADMIN],
            [Model\User::ROLE_CLIENT],
            [Model\User::ROLE_LABEL_COORDINATOR],
            [Model\User::ROLE_LABELER],
        );
    }

    protected function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->voter = $this->getAnnostationService('voter.access_check.task');

        $this->user = $this->createUser();
        $this->user->removeRole(Model\User::ROLE_ADMIN);

        $this->client = $this->createUser('client-1');
        $this->labelCoordinator = $this->createUser('label-coordinator-1');

        $this->token = $this->getMockBuilder(TokenInterface::class)->getMock();
        $this->token->method('getUser')->willReturn($this->user);

        $this->video = $this->createVideo('video-1');

        $this->project = Model\Project::create(
            'project-1',
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
            $this->user,
            new \DateTime(),
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS
        );
        $this->labelingTaskFacade->save($this->task);

        $this->assertSame(
            VoterInterface::ACCESS_GRANTED,
            $this->voter->vote($this->token, $this->task, [AccessCheckVoter\Task::TASK_READ])
        );
    }

    /**
     * @dataProvider provideRoles
     */
    public function testNotAssignedUserHasReadAccess($role)
    {
        $this->user->addRole($role);

        $this->assertSame(
            VoterInterface::ACCESS_GRANTED,
            $this->voter->vote($this->token, $this->task, [AccessCheckVoter\Task::TASK_READ])
        );
    }

    /**
     * @dataProvider provideRoles
     */
    public function testAssignedUserHasWriteAccess($role) {
        $this->user->addRole($role);

        $this->task->addAssignmentHistory(
            $this->user,
            new \DateTime(),
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS
        );
        $this->labelingTaskFacade->save($this->task);

        $this->assertSame(
            VoterInterface::ACCESS_GRANTED,
            $this->voter->vote($this->token, $this->task, [AccessCheckVoter\Task::TASK_WRITE])
        );
    }

    /**
     * @dataProvider provideRoles
     */
    public function testNotAssignedUserHasNoWriteAccess($role) {
        $this->user->addRole($role);

        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($this->token, $this->task, [AccessCheckVoter\Task::TASK_WRITE])
        );
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