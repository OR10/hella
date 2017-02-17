<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class InterpolateTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/interpolate/%s';

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
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Service\Interpolation
     */
    private $interpolationService;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;

    public function testStartInterpolationActionReturnsNotFoundWithUnknownTaskId()
    {
        $response = $this->createRequest(self::ROUTE, ['unknown-task-id', 'dont-care'])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testStartInterpolationActionReturnsNotFoundWithUnknownLabeledThingId()
    {
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), 'unknown-labeled-thing-id'])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testStartInterpolationActionReturnsBadRequestWhenLabeledThingDoesNotBelongToLabelingTask()
    {
        $otherTask = $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->video,
                $this->project,
                range(1, 10),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
        $otherTask->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $otherTask->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            $this->user,
            new \DateTime
        );
        $this->labelingTaskFacade->save($otherTask);

        $response = $this->createRequest(self::ROUTE, [$otherTask->getId(), $this->labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testStartInterpolationActionReturnsBadRequestWhenTypeIsMissing()
    {
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade          = $this->getAnnostationService('database.facade.video');
        $this->projectFacade        = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade   = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade   = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labelingGroupFacade  = $this->getAnnostationService('database.facade.labeling_group');
        $this->interpolationService = $this->getAnnostationService('service.interpolation');
        $organisationFacade         = $this->getAnnostationService('database.facade.organisation');

        $organisation = $organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_ADMIN);

        $labelingGroup = $this->labelingGroupFacade->save(Model\LabelingGroup::create([], [$this->user->getId()]));

        $this->project = Model\Project::create('test project', $organisation, $this->user);
        $this->project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($this->project);

        $this->video   = $this->videoFacade->save(Model\Video::create($organisation, 'Testvideo'));
        $task          = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(1, 10),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $task->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            $this->user,
            new \DateTime
        );
        $this->task         = $this->labelingTaskFacade->save($task);
        $this->labeledThing = $this->labeledThingFacade->save(Model\LabeledThing::create($this->task));
    }
}
