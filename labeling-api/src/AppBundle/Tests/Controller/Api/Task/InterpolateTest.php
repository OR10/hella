<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class InterpolateTest extends Tests\WebTestCase
{
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

    public function testStartInterpolationActionReturnsNotFoundWithUnknownTaskId()
    {
        $response = $this->startInterpolationRequest('unknown-task-id', 'dont-care');

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testStartInterpolationActionReturnsNotFoundWithUnknownLabeledThingId()
    {
        $task = $this->createTask();

        $response = $this->startInterpolationRequest($task->getId(), 'unknown-labeled-thing-id');

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testStartInterpolationActionReturnsBadRequestWhenLabeledThingDoesNotBelongToLabelingTask()
    {
        $task         = $this->createTask();
        $labeledThing = $this->createLabeledThing($task);
        $anotherTask  = $this->createTask();

        $response = $this->startInterpolationRequest($anotherTask->getId(), $labeledThing->getId());

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testStartInterpolationActionReturnsBadRequestWhenTypeIsMissing()
    {
        $task         = $this->createTask();
        $labeledThing = $this->createLabeledThing($task);

        $response = $this->startInterpolationRequest($task->getId(), $labeledThing->getId());

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->getService('fos_user.util.user_manipulator')->create(
            Controller\IndexTest::USERNAME,
            Controller\IndexTest::PASSWORD,
            Controller\IndexTest::EMAIL,
            true,
            false
        );

        $this->videoFacade          = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade   = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade   = $this->getAnnostationService('database.facade.labeled_thing');
        $this->interpolationService = $this->getAnnostationService('service.interpolation');
    }

    private function startInterpolationRequest($taskId, $labeledThingId, array $content = null)
    {
        return $this->doRequest(
            HttpFoundation\Request::METHOD_POST,
            $taskId,
            $labeledThingId,
            $content
        );
    }

    private function doRequest($method, $taskId, $labeledThingId, array $content = null)
    {
        $client  = $this->createClient();
        $crawler = $client->request(
            $method,
            sprintf(
                '/api/task/%s/interpolate/%s.json',
                $taskId,
                $labeledThingId
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW' => Controller\IndexTest::PASSWORD,
                'CONTENT_TYPE' => 'application/json',
            ],
            $content === null ? null : json_encode($content)
        );

        return $client->getResponse();
    }

    /**
     * @return Model\LabeledThing
     */
    private function createLabeledThing(Model\LabelingTask $task = null)
    {
        $labeledThing = new Model\LabeledThing($task ?: $this->createTask());
        $this->labeledThingFacade->save($labeledThing);
        return $labeledThing;
    }

    /**
     * @return Model\LabelingTask
     */
    private function createTask(Model\Video $video = null)
    {
        $task = new Model\LabelingTask(
            $video ?: $this->createVideo(),
            new Model\FrameRange(1, 10),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $this->labelingTaskFacade->save($task);
        return $task;
    }

    /**
     * @return Model\Video
     */
    private function createVideo()
    {
        $video = new Model\Video('Testvideo');
        $this->videoFacade->save($video);
        return $video;
    }
}
