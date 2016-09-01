<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class TimerTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/timer/%s';

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
     * @var Model\User
     */
    private $user;

    /**
     * @var Model\User
     */
    private $otherUser;

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

    public function testInitialTimeIsZero()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->user->getId()])->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                "result" => [
                    "time" => 0,
                ]
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetAlreadySavedTime()
    {
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($this->task, $this->user, 23));

        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->user->getId()])->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                "result" => [
                    "time" => 23,
                ]
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testUpdateTimer()
    {
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($this->task, $this->user, 23));

        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['time' => 123])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                "result" => [
                    "time" => 123,
                ]
            ],
            $request->getJsonResponseBody()
        );
        $this->assertEquals(
            123,
            $this->labelingTaskFacade->getTimerForTaskAndUser($this->task, $this->user)->getTimeInSeconds(Model\LabelingTask::PHASE_LABELING)
        );
    }

    public function testUpdateTimerWithInvalidTimeRespondsWithBadRequest()
    {
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['time' => 'some-invalid-time'])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testGetTimerForOtherUserIsForbidden()
    {
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->otherUser->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_GET)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testChangeTimerForOtherUserIsForbidden()
    {
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $this->otherUser->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(['time' => 123])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->projectFacade        = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');

        $userManipulator = $this->getService('fos_user.util.user_manipulator');

        $this->user = $userManipulator
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_ADMIN);

        $this->otherUser = $userManipulator
            ->create('someOtherUser', 'someOtherPassword', 'some@other.email', true, false);

        $this->video = $this->videoFacade->save(Model\Video::create('Testvideo'));
        $this->project = $this->projectFacade->save(Model\Project::create('test project'));
        $task = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(1, 10),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $task->addAssignmentHistory(
            $this->user,
            new \DateTime,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS
        );
        $this->task = $this->labelingTaskFacade->save($task);
    }
}
