<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Tests;
use Symfony\Component\HttpFoundation;
use AnnoStationBundle\Tests\Helper;

class PhaseTest extends Tests\WebTestCase
{
    const ROUTE = '/api/v1/task/%s/phase';

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

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    public function testTryMoveLabelingInProgressTaskToRevisionTodoPhase()
    {
        $labelLabelManager = $this->createLabelManagerUser($this->organisation);
        $task = $this->createLabelingTask($labelLabelManager);
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $this->labelingTaskFacade->save($task);

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->withCredentialsFromUsername($labelLabelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::PHASE_REVISION])
            ->execute()
            ->getResponse();

        $this->assertEquals(412, $response->getStatusCode());
    }

    public function testTryToMoveRevisionTaskToLabelingPhaseAsLabeler()
    {
        $labelManager = $this->createLabelManagerUser($this->organisation);
        $labeler = $this->createLabelerUser($this->organisation);

        $labelingGroup = $this->labelingGroupFacade->save(
            Helper\LabelingGroupBuilder::create($this->organisation)
                ->withLabelManagers([$labelManager])
                ->withUsers([$labeler])
                ->build()
        );

        $task = $this->createLabelingTask($labelManager, $labelingGroup);
        $task->setStatus(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_TODO);
        $task->addAssignmentHistory(Model\LabelingTask::PHASE_REVISION, $labeler);
        $this->labelingTaskFacade->save($task);

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->withCredentialsFromUsername($labeler)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::PHASE_LABELING])
            ->execute()
            ->getResponse();

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testMoveRevisionDoneTaskToLabelingTodoPhase()
    {
        $labelManager = $this->createLabelManagerUser($this->organisation);

        $task = $this->createLabelingTask($labelManager);
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
        $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_DONE);
        $task->setStatus(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_DONE);
        $this->labelingTaskFacade->save($task);

        $this->createRequest(self::ROUTE, [$task->getId()])
            ->withCredentialsFromUsername($labelManager)
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
        $labelManager = $this->createLabelManagerUser($this->organisation);

        $task = $this->createLabelingTask($labelManager);
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
        $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO);
        $this->labelingTaskFacade->save($task);

        $this->createRequest(self::ROUTE, [$task->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['phase' => Model\LabelingTask::STATUS_ALL_PHASES_DONE])
            ->execute()
            ->getResponse();

        $actualTask = $this->labelingTaskFacade->find($task->getId());

        $this->assertTrue($actualTask->isAllPhasesDone());
    }

    private function createLabelingTask(Model\User $labelManager = null, Model\LabelingGroup $labelingGroup = null)
    {
        $project = Helper\ProjectBuilder::create($this->organisation);
        if ($labelManager !== null) {
            $project->withAddedLabelManagerAssignment($labelManager);
        }
        if ($labelingGroup !== null) {
            $project->withLabelGroup($labelingGroup);
        }
        $project = $this->projectFacade->save($project->build());

        $video   = $this->videoFacade->save(
            Helper\VideoBuilder::create($this->organisation)->build()
        );
        $task    = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)->build()
        );

        return $task;
    }

    protected function setUpImplementation()
    {
        $this->videoFacade         = $this->getAnnostationService('database.facade.video');
        $this->projectFacade       = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade  = $this->getAnnostationService('database.facade.labeling_task');
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');
        $this->organisationFacade  = $this->getAnnostationService('database.facade.organisation');
        $this->organisation        = $this->organisationFacade->save(Helper\OrganisationBuilder::create()->build());

        $userManipulator = $this->getService('fos_user.util.user_manipulator');
    }
}
