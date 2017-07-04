<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use GuzzleHttp;

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

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $taskDatabaseSecurityPermissionService;

    public function testAssignTaskToUser()
    {
        $user = $this->createUser();
        $task = $this->createLabelingTask();

        $response = $this->createRequest(self::ROUTE, [$task->getId(), $user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->compareAssignedUserToCouchDbSecurityDocument($task, 'annostation_user');
    }

    public function testDeleteAssignedLabelingTask()
    {
        $user = $this->createUser();
        $task = $this->createLabelingTask();
        $task->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_TODO,
            $user,
            new \DateTime('2017-04-26')
        );
        $this->taskDatabaseSecurityPermissionService->updateForTask($task);

        $response = $this->createRequest(self::ROUTE, [$task->getId(), $user->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->compareAssignedUserToCouchDbSecurityDocument($task, null);
    }

    private function compareAssignedUserToCouchDbSecurityDocument(Model\LabelingTask $task, $user)
    {
        $resource = $this->guzzleClient->request(
            'GET',
            sprintf(
                'http://%s:%s@%s:%s/%s/_security',
                $this->getContainer()->getParameter('couchdb_user'),
                $this->getContainer()->getParameter('couchdb_password'),
                $this->getContainer()->getParameter('couchdb_host'),
                $this->getContainer()->getParameter('couchdb_port'),
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $task->getProjectId(),
                    $task->getId()
                )
            )
        );

        $response = json_decode($resource->getBody()->getContents(), true);
        $this->assertEquals($user, $response['assignedLabeler']);
    }

    protected function setUpImplementation()
    {
        $this->videoFacade                           = $this->getAnnostationService('database.facade.video');
        $this->projectFacade                         = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade                    = $this->getAnnostationService('database.facade.labeling_task');
        $this->organisationFacade                    = $this->getAnnostationService('database.facade.organisation');
        $this->taskDatabaseCreatorService            = $this->getAnnostationService('service.task_database_creator');
        $this->taskDatabaseSecurityPermissionService = $this->getAnnostationService(
            'service.task_database_security_permission_service'
        );
        $this->guzzleClient                          = $this->getService('guzzle.client');
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
        $this->labelingTaskFacade->save($task);
        $this->taskDatabaseCreatorService->createDatabase($project, $task);

        return $task;
    }
}
