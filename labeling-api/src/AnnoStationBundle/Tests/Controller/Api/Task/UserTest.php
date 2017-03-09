<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
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

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

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
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
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
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));
        $video        = $this->videoFacade->save(Model\Video::create($organisation, 'foobar'));
        $project      = $this->projectFacade->save(Model\Project::create('test project', $organisation));
        $task         = Model\LabelingTask::create(
            $video,
            $project,
            range($startRange, $endRange),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);

        return $this->labelingTaskFacade->save($task);
    }
}
