<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;
use AppBundle\Tests\Helper;

class AttentionTest extends Tests\WebTestCase
{
    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    public function testEnableAttentionAsLabeler()
    {
        $response = $this->createRequest('/api/task/%s/attention/enable', [$this->task->getId()], 'labeler', 'labeler')
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testEnableAttentionAsAnotherCoordinator()
    {
        $response = $this->createRequest(
            '/api/task/%s/attention/enable',
            [$this->task->getId()],
            'label_coordinator_2',
            'label_coordinator_2'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testEnableAttentionAsCoordinator()
    {
        $response = $this->createRequest(
            '/api/task/%s/attention/enable',
            [$this->task->getId()],
            'label_coordinator',
            'label_coordinator'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(200, $response->getStatusCode());

        $actualTask = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertTrue($actualTask->isAttentionFlag());
    }

    public function testDisableAttentionAsCoordinator()
    {
        $response = $this->createRequest(
            '/api/task/%s/attention/disable',
            [$this->task->getId()],
            'label_coordinator',
            'label_coordinator'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(200, $response->getStatusCode());

        $actualTask = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertFalse($actualTask->isAttentionFlag());
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Video $videoFacade */
        $videoFacade = $this->getAnnostationService('database.facade.video');
        /** @var Facade\Project $projectFacade */
        $projectFacade = $this->getAnnostationService('database.facade.project');
        /** @var Facade\LabelingTask $labelingTaskFacade */
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        /** @var Facade\User $userFacade */
        $userFacade = $this->getAnnostationService('database.facade.user');

        $labelUser = $userFacade->updateUser(Helper\UserBuilder::createDefaultLabeler()->build());
        $coordinatorUser = $userFacade->updateUser(Helper\UserBuilder::createDefaultLabelCoordinator()->build());
        $anotherCoordinatorUser = Helper\UserBuilder::create()
            ->withUsername('label_coordinator_2')
            ->withPlainPassword('label_coordinator_2')
            ->withRoles([Model\User::ROLE_LABEL_COORDINATOR])
            ->build();
        $this->userFacade->updateUser($anotherCoordinatorUser);

        $project = Helper\ProjectBuilder::create();
        $project->withAddedCoordinatorAssignment($coordinatorUser);
        $project = $projectFacade->save($project->build());

        $video = $videoFacade->save(Helper\VideoBuilder::create()->build());

        $task = Helper\LabelingTaskBuilder::create($project, $video);

        $this->task = $this->labelingTaskFacade->save($task->build());
    }
}