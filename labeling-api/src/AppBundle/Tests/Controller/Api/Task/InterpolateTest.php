<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class InterpolateTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/interpolate/%s';

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Service\Interpolation
     */
    private $interpolationService;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\LabelingTask
     */
    private $task;

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
                new Model\FrameRange(1, 10),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );

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
        $this->labelingTaskFacade   = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade   = $this->getAnnostationService('database.facade.labeled_thing');
        $this->interpolationService = $this->getAnnostationService('service.interpolation');

        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);

        $this->video = $this->videoFacade->save(Model\Video::create('Testvideo'));
        $this->task  = $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->video,
                new Model\FrameRange(1, 10),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
        $this->labeledThing = $this->labeledThingFacade->save(Model\LabeledThing::create($this->task));
    }
}
