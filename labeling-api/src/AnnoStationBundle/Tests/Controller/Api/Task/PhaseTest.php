<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;
use AnnoStationBundle\Tests\Helper;

class PhaseTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/phase';

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    public function testMoveLabelingInProgressTaskToRevisionTodoPhase()
    {
        $task = $this->createLabelingTask();
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $this->labelingTaskFacade->save($task);

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::PHASE_REVISION])
            ->execute()
            ->getResponse();

        $this->assertEquals(412, $response->getStatusCode());
    }

    public function testMoveRevisionDoneTaskToLabelingTodoPhase()
    {
        $task = $this->createLabelingTask();
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
        $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_DONE);
        $task->setStatus(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_DONE);
        $this->labelingTaskFacade->save($task);

        $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::PHASE_LABELING])
            ->execute()
            ->getResponse();

        $actualTask = $this->labelingTaskFacade->find($task->getId());

        $this->assertEquals(
            Model\LabelingTask::STATUS_TODO,
            $actualTask->getStatus(Model\LabelingTask::PHASE_LABELING)
        );
        $this->assertEquals(
            Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION,
            $actualTask->getStatus(Model\LabelingTask::PHASE_REVIEW)
        );
        $this->assertEquals(
            Model\LabelingTask::STATUS_DONE,
            $actualTask->getStatus(Model\LabelingTask::PHASE_REVISION)
        );
        $this->assertFalse($actualTask->isAllPhasesDone());
    }

    public function testMoveTodoReviewTaskToAllDone()
    {
        $task = $this->createLabelingTask();
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
        $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO);
        $this->labelingTaskFacade->save($task);

        $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::STATUS_ALL_PHASES_DONE])
            ->execute()
            ->getResponse();

        $actualTask = $this->labelingTaskFacade->find($task->getId());

        $this->assertTrue($actualTask->isAllPhasesDone());
    }

    private function createLabelingTask()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();

        $project = $this->projectFacade->save(
            Helper\ProjectBuilder::create($organisation)->build()
        );
        $video   = $this->videoFacade->save(
            Helper\VideoBuilder::create($organisation)->build()
        );
        $task    = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)->build()
        );

        return $task;
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->projectFacade      = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');

        $userManipulator = $this->getService('fos_user.util.user_manipulator');

        $user = $userManipulator
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $user->addRole(Model\User::ROLE_LABEL_COORDINATOR);
    }
}
