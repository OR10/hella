<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class TimerTest extends Tests\WebTestCase
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
     * @var Model\User
     */
    private $user;

    /**
     * @var Model\User
     */
    private $otherUser;

    public function testInitialTimeIsZero()
    {
        $task = $this->createTask();

        $response = $this->doRequest(HttpFoundation\Request::METHOD_GET, $task->getId(), $this->user->getId());

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals(
            [
                "result" => [
                    "time" => 0,
                ]
            ],
            json_decode($response->getContent(), true)
        );
    }

    public function testGetAlreadySavedTime()
    {
        $task = $this->createTask();
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($task, $this->user, 23));

        $response = $this->doRequest(HttpFoundation\Request::METHOD_GET, $task->getId(), $this->user->getId());

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals(
            [
                "result" => [
                    "time" => 23,
                ]
            ],
            json_decode($response->getContent(), true)
        );
    }

    public function testUpdateTimer()
    {
        $task = $this->createTask();
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($task, $this->user, 23));

        $response = $this->doRequest(
            HttpFoundation\Request::METHOD_PUT,
            $task->getId(),
            $this->user->getId(),
            [
                "time" => 123,
            ]
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals(
            [
                "result" => [
                    "time" => 123,
                ]
            ],
            json_decode($response->getContent(), true)
        );
        $this->assertEquals(
            123,
            $this->labelingTaskFacade->getTimerForTaskAndUser($task, $this->user)->getTimeInSeconds()
        );
    }

    public function testUpdateTimerWithInvalidTimeRespondsWithBadRequest()
    {
        $task = $this->createTask();

        $response = $this->doRequest(
            HttpFoundation\Request::METHOD_PUT,
            $task->getId(),
            $this->user->getId(),
            [
                "time" => "some-invalid-time",
            ]
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testGetTimerForOtherUserIsForbidden()
    {
        $task = $this->createTask();

        $response = $this->doRequest(
            HttpFoundation\Request::METHOD_GET,
            $task->getId(),
            $this->otherUser->getId()
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testChangeTimerForOtherUserIsForbidden()
    {
        $task = $this->createTask();

        $response = $this->doRequest(
            HttpFoundation\Request::METHOD_PUT,
            $task->getId(),
            $this->otherUser->getId(),
            [
                "time" => 123,
            ]
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnoService('database.facade.video');
        $this->labelingTaskFacade = $this->getAnnoService('database.facade.labeling_task');

        $this->user = $this->getService('fos_user.util.user_manipulator')->create(
            Controller\IndexTest::USERNAME,
            Controller\IndexTest::PASSWORD,
            Controller\IndexTest::EMAIL,
            true,
            false
        );
        $this->otherUser = $this->getService('fos_user.util.user_manipulator')->create(
            'someOtherUser',
            'someOtherPassword',
            'some@other.email',
            true,
            false
        );
    }

    private function getAnnoService($name)
    {
        return $this->getService(sprintf('annostation.labeling_api.%s', $name));
    }

    private function getService($name)
    {
        return static::$kernel->getContainer()->get($name);
    }

    private function doRequest($method, $taskId, $userId, array $content = null)
    {
        $client  = $this->createClient();
        $crawler = $client->request(
            $method,
            sprintf('/api/task/%s/timer/%s.json', $taskId, $userId),
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
     * @return Model\LabelingTask
     */
    private function createTask()
    {
        $task = new Model\LabelingTask($this->createVideo(), new Model\FrameRange(1, 10));
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
