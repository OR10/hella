<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class UserTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/user/%s/assign';

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

    public function testAssignTaskToUser()
    {
        $user = $this->createUser();
        $task = $this->createLabelingTask();

        $response = $this->createRequest(self::ROUTE, [$task->getId(), $user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testDeleteAssignedLabelingTask()
    {
        $user = $this->createUser();
        $task = $this->createLabelingTask();

        $this->createRequest(self::ROUTE, [$task->getId(), $user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute()
            ->getResponse();

        $response = $this->createRequest(self::ROUTE, [$task->getId(), $user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->projectFacade      = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
    }

    private function createUser(
        $username = self::USERNAME,
        $email = self::EMAIL,
        $roles = array(Model\User::ROLE_ADMIN)
    ) {
        /** @var Model\User $user */
        $user = $this->getService('fos_user.util.user_manipulator')
            ->create($username, self::PASSWORD, $email, true, false);
        $user->setRoles($roles);

        return $user;
    }

    private function createLabelingTask($startRange = 10, $endRange = 20)
    {
        $video = $this->videoFacade->save(Model\Video::create('foobar'));
        $project = $this->projectFacade->save(Model\Project::create('test project'));
        $task  = Model\LabelingTask::create(
            $video,
            $project,
            range($startRange, $endRange),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::STATUS_WAITING);

        return $this->labelingTaskFacade->save($task);
    }
}
