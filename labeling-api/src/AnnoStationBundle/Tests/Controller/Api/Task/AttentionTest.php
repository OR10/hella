<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Tests\Helper as AppBundleHelper;

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
        $response = $this->createRequest('/api/v1/task/%s/attention/enable', [$this->task->getId()], 'labeler', 'labeler')
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testEnableAttentionAsCoordinator()
    {
        $response = $this->createRequest(
            '/api/v1/task/%s/attention/enable',
            [$this->task->getId()],
            'label_coordinator',
            'label_coordinator'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(200, $response->getStatusCode());

        $actualTask = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertTrue($actualTask->isTaskAttentionFlag());
    }

    public function testDisableAttentionAsCoordinator()
    {
        $response = $this->createRequest(
            '/api/v1/task/%s/attention/disable',
            [$this->task->getId()],
            'label_coordinator',
            'label_coordinator'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(200, $response->getStatusCode());

        $actualTask = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertFalse($actualTask->isTaskAttentionFlag());
    }

    public function testEnableAttentionAsAnotherLabeler()
    {
        $response = $this->createRequest(
            '/api/v1/task/%s/attention/enable',
            [$this->task->getId()],
            'label_coordinator_2',
            'label_coordinator_2'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testEnableAttentionAsAnotherCoordinator()
    {
        $response = $this->createRequest(
            '/api/v1/task/%s/attention/enable',
            [$this->task->getId()],
            'labeler_2',
            'labeler_2'
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(403, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Video $videoFacade */
        $videoFacade = $this->getAnnostationService('database.facade.video');
        /** @var Facade\Project $projectFacade */
        $projectFacade            = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        /** @var Facade\LabelingGroup $labelingGroup */
        $labelingGroup = $this->getAnnostationService('database.facade.labeling_group');
        /** @var AppFacade\User $userFacade */
        $userFacade = $this->getAnnostationService('database.facade.user');

        $labelerUser        = $userFacade->updateUser(AppBundleHelper\UserBuilder::createDefaultLabeler()->build());
        $anotherLabelerUser = AppBundleHelper\UserBuilder::create()
            ->withUsername('labeler_2')
            ->withPlainPassword('labeler_2')
            ->withRoles([Model\User::ROLE_LABELER])
            ->build();
        $this->userFacade->updateUser($anotherLabelerUser);
        $coordinatorUser = $userFacade->updateUser(
            AppBundleHelper\UserBuilder::createDefaultLabelCoordinator()->build()
        );
        $anotherCoordinatorUser = AppBundleHelper\UserBuilder::create()
            ->withUsername('label_coordinator_2')
            ->withPlainPassword('label_coordinator_2')
            ->withRoles([Model\User::ROLE_LABEL_COORDINATOR])
            ->build();
        $this->userFacade->updateUser($anotherCoordinatorUser);

        $organisation = Helper\OrganisationBuilder::create()->build();

        $labelingGroup = $labelingGroup->save(
            Helper\LabelingGroupBuilder::create($organisation)
                ->withCoordinators([$coordinatorUser->getId()])
                ->withUsers([$labelerUser->getId()])
                ->build()
        );

        $project = Helper\ProjectBuilder::create($organisation)
            ->withAddedCoordinatorAssignment($coordinatorUser)
            ->withLabelGroup($labelingGroup);
        $project = $projectFacade->save($project->build());

        $video = $videoFacade->save(Helper\VideoBuilder::create($organisation)->build());

        $task = Helper\LabelingTaskBuilder::create($project, $video)
            ->withAddedUserAssignment(
                $labelerUser,
                Model\LabelingTask::PHASE_LABELING,
                Model\LabelingTask::STATUS_IN_PROGRESS
            );

        $this->task = $this->labelingTaskFacade->save($task->build());
    }
}
