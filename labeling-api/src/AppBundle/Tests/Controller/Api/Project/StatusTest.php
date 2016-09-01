<?php

namespace AppBundle\Tests\Controller\Api\Project;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;

class StatusTest extends Tests\WebTestCase
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Util\UserManipulator
     */
    private $userService;

    public function testAcceptProject()
    {
        $project = $this->createProject();
        $labelingGroup = $this->createLabelingGroup($this->user);
        $this->createRequest('/api/project/%s/status/accept', [$project->getId()])
            ->setJsonBody(
                [
                    'assignedGroupId' => $labelingGroup->getId(),
                ]
            )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $project = $this->projectFacade->find($project->getId());

        $this->assertSame(Model\Project::STATUS_IN_PROGRESS, $project->getStatus());
        $this->assertSame($this->user->getId(), $project->getLatestAssignedCoordinatorUserId());
        $this->assertSame($labelingGroup->getId(), $project->getLabelingGroupId());
    }

    public function testDoneProject()
    {
        $project = $this->createProject();
        $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $project = $this->projectFacade->find($project->getId());

        $this->assertSame(Model\Project::STATUS_DONE, $project->getStatus());
    }

    public function testDoneProjectWithIncompleteTasks()
    {
        $project      = $this->createProject();
        $this->createTask($project);
        $reponse =$this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $this->assertSame($reponse->getResponse()->getStatusCode(), 400);
    }

    private function createProject()
    {
        $project = Model\Project::create('foobar');
        $project->addCoordinatorAssignmentHistory($this->user);
        $this->projectFacade->save($project);

        return $project;
    }

    private function createLabelingGroup(Model\User $coordinator)
    {
        $labeler = $this->userService->create('somelabeler', '123', 'a@b.c', true, false);
        $labelingGroup = Model\LabelingGroup::create($coordinator, $labeler);
        $this->labelingGroupFacade->save($labelingGroup);

        return $labelingGroup;
    }

    private function createTask(Model\Project $project)
    {
        $video = new Model\Video('foobar');
        $labelingTask = Model\LabelingTask::create($video, $project, [], Model\LabelingTask::TYPE_OBJECT_LABELING);
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Project projectFacade */
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        /** @var Facade\LabelingGroup labelingGroupFacade */
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');

        /** @var Facade\LabelingTask labelingTaskFacade */
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');

        /** @var Util\UserManipulator userService */
        $this->userService = $this->getService('fos_user.util.user_manipulator');

        $this->user = $this->userService->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->setRoles([Model\User::ROLE_LABEL_COORDINATOR]);
    }
}
