<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Controller\Api\Task\Replication;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Tests;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Request;

class ReplicationTest extends Tests\WebTestCase
{
    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\User
     */
    private $admin;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Video
     */
    private $video;

    public function testGetReplicationForTask()
    {
        $response = $this->createRequest('/api/task/%s/replication', [$this->task->getId()])
            ->withCredentialsFromUsername($this->admin)
            ->execute()
            ->getResponse();

        $client = static::createClient();

        $databaseName        = sprintf('taskdb-project-%s-task-%s', $this->project->getId(), $this->task->getId());
        $externalCouchDbHost = $client->getKernel()->getContainer()->getParameter('couchdb_host_external');
        $externalCouchDbPort = $client->getKernel()->getContainer()->getParameter('couchdb_port_external');
        $externalCouchDbPath = $client->getKernel()->getContainer()->getParameter('couchdb_path_external');
        $username            = sprintf(
            '%s%s',
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX,
            'admin'
        );

        $expectedResponse = [
            'result' => [
                'taskId'         => $this->task->getId(),
                'databaseName'   => $databaseName,
                'databaseServer' => sprintf(
                    'http://%s:%s@%s:%s/%s',
                    $username,
                    'password1234',
                    $externalCouchDbHost,
                    $externalCouchDbPort,
                    $externalCouchDbPath
                ),
                'databaseUsername' => $username,
                'databasePassword' => 'password1234',
            ],
        ];

        $this->assertEquals($expectedResponse, json_decode($response->getContent(), true));
    }

    public function testGetReplicationForTaskWithHttpsProtocol()
    {
        $databaseName        = sprintf('taskdb-project-%s-task-%s', $this->project->getId(), $this->task->getId());
        $externalCouchDbHost = 'foobar';
        $externalCouchDbPort = '443';
        $externalCouchDbPath = 'blubb';

        $tokenStorageMock = $this->getTokenStorageInterfaceMock();
        $tokenMock = $this->getTokenMock();
        $userMock = $this->getUserMock();

        $tokenStorageMock->expects($this->once())
            ->method('getToken')
            ->willReturn($tokenMock);

        $tokenMock->expects($this->once())
            ->method('getUser')
            ->willReturn($userMock);

        $replication = new Replication($tokenStorageMock, $externalCouchDbHost, $externalCouchDbPort, $externalCouchDbPath);

        $plainUsername = 'admin';
        $username            = sprintf(
            '%s%s',
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX,
            $plainUsername
        );

        $userMock->expects($this->once())
            ->method('getUsername')
            ->willReturn($plainUsername);

        $userMock->expects($this->any())
            ->method('getCouchDbPassword')
            ->willReturn('password1234');

        $expectedResponse = View\View::create()->setData([
            'result' => [
                'taskId'         => $this->task->getId(),
                'databaseName'   => $databaseName,
                'databaseServer' => sprintf(
                    'https://%s:%s@%s:%s/%s',
                    $username,
                    'password1234',
                    $externalCouchDbHost,
                    $externalCouchDbPort,
                    $externalCouchDbPath
                ),
                'databaseUsername' => $username,
                'databasePassword' => 'password1234',
            ],
        ]);

        $actualResponse = $replication->getReplicationDatabaseAction($this->getRequestMock(), $this->task);

        $this->assertEquals($expectedResponse, $actualResponse);
    }

    private function getTokenStorageInterfaceMock()
    {
        return $this->getMockBuilder(Storage\TokenStorageInterface::class)
            ->disableOriginalConstructor()
            ->setMethods(['getToken', 'setToken'])
            ->getMock();
    }

    private function getTokenMock()
    {
        return $this->getMockBuilder(TokenInterface::class)
            ->getMock();
    }

    private function getUserMock()
    {
        return $this->getMockBuilder(\stdClass::class)
            ->setMethods(['getUsername', 'getCouchDbPassword'])
            ->getMock();
    }

    private function getRequestMock()
    {
        return $this->getMockBuilder(Request::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    protected function setUpImplementation()
    {
        $organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $videoFacade        = $this->getAnnostationService('database.facade.video');
        $projectFacade      = $this->getAnnostationService('database.facade.project');
        $taskFacade         = $this->getAnnostationService('database.facade.labeling_task');

        $organisation = $organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());
        $this->admin  = $this->createAdminUser($organisation);
        $this->admin->setCouchDbPassword('password1234');
        $this->userFacade->saveUser($this->admin);

        $this->project = $projectFacade->save(Tests\Helper\ProjectBuilder::create($organisation)->build());
        $this->video   = $videoFacade->save(Tests\Helper\VideoBuilder::create($organisation)->build());
        $this->task    = $taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($this->project, $this->video)->build()
        );
    }
}
