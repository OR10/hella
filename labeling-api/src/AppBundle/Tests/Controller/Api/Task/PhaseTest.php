<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;
use AppBundle\Tests\Helper;

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
        $task     = $this->createLabelingTask(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS
        );
        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::PHASE_REVISION])
            ->execute()
            ->getResponse();

        $this->assertEquals(412, $response->getStatusCode());
    }

    public function testMoveRevisionDoneTaskToLabelingTodoPhase()
    {
        $task = $this->createLabelingTask(
            Model\LabelingTask::PHASE_REVISION,
            Model\LabelingTask::STATUS_DONE
        );
        $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::PHASE_LABELING])
            ->execute()
            ->getResponse();

        $actualTask   = $this->labelingTaskFacade->find($task->getId());
        $actualPhase  = $actualTask->getCurrentPhase();
        $actualStatus = $actualTask->getStatus($actualPhase);

        $this->assertEquals(Model\LabelingTask::PHASE_LABELING, $actualPhase);
        $this->assertEquals(Model\LabelingTask::STATUS_TODO, $actualStatus);
        $this->assertFalse($actualTask->isAllPhasesDone());
    }

    public function testMoveTodoLabelingTaskToAllDone()
    {
        $task = $this->createLabelingTask(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_TODO
        );
        $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::STATUS_ALL_PHASES_DONE])
            ->execute()
            ->getResponse();

        $actualTask = $this->labelingTaskFacade->find($task->getId());

        $this->assertTrue($actualTask->isAllPhasesDone());
    }

    private function createLabelingTask($phase, $status)
    {
        $project = $this->projectFacade->save(
            Helper\ProjectBuilder::create()->build()
        );
        $video   = $this->videoFacade->save(
            Helper\VideoBuilder::create()->build()
        );
        $task    = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)->withStatus($phase, $status)->build()
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
