<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AppBundle\Tests;
use AnnoStationBundle\Tests\Helper;
use GuzzleHttp;
use Doctrine\ODM\CouchDB;

class TaskDatabaseValidateDocUpdateDocumentServiceTest extends Tests\KernelTestCase
{
    /**
     * @var string
     */
    private $databaseName = 'test_validate_doc';

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var Service\TaskDatabaseValidateDocUpdateDocumentService
     */
    private $taskDatabaseValidateDocUpdateService;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

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
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $taskDatabaseSecurityPermissionService;

    /**
     * @var Service\UserRolesRebuilder
     */
    private $userRolesRebuilderService;

    public function testCreateValidateUpdateDocument()
    {
        $this->taskDatabaseValidateDocUpdateService->updateForDatabase($this->databaseName);

        $resource = $this->guzzleClient->request(
            'GET',
            sprintf(
                'http://%s:%s@%s:%s/%s/_design/validation',
                $this->getContainer()->getParameter('couchdb_user'),
                $this->getContainer()->getParameter('couchdb_password'),
                $this->getContainer()->getParameter('couchdb_host'),
                $this->getContainer()->getParameter('couchdb_port'),
                $this->databaseName
            )
        );

        $response = json_decode($resource->getBody()->getContents(), true);
        
        $this->assertEquals(
            file_get_contents(__DIR__ . '/TaskDatabaseValidateDocUpdateDocumentServiceTest/validate_doc_function.js'),
            $response['validate_doc_update']
        );
    }

    public function testCreateDocumentForAssignedUser()
    {
        $organisation  = $this->organisationFacade->save(Helper\OrganisationBuilder::create()->build());
        $user          = $this->userFacade->createUser('user', 'foo@bar.com', '1234');
        $labelingGroup = $this->labelingGroupFacade->save(
            Helper\LabelingGroupBuilder::create($organisation)->withUsers([$user->getId()])->build()
        );
        $project       = $this->projectFacade->save(
            Helper\ProjectBuilder::create($organisation)->withLabelGroup($labelingGroup)->build()
        );
        $video         = $this->videoFacade->save(Helper\VideoBuilder::create($organisation)->build());
        $task          = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)->withAddedUserAssignment(
                $user,
                Model\LabelingTask::PHASE_LABELING,
                Model\LabelingTask::STATUS_IN_PROGRESS
            )->build()
        );
        $this->taskDatabaseCreatorService->createDatabase($project, $task);
        $this->taskDatabaseSecurityPermissionService->updateForTask($task);
        $this->taskDatabaseValidateDocUpdateService->updateForDatabase(
            $this->taskDatabaseCreatorService->getDatabaseName($project->getId(), $task->getId())
        );
        $this->userRolesRebuilderService->rebuildForUser($user);

        $url = sprintf(
            'http://%s:%s@%s:%s/%s/',
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX . $user->getUsername(),
            $user->getCouchDbPassword(),
            $this->getContainer()->getParameter('couchdb_host'),
            $this->getContainer()->getParameter('couchdb_port'),
            $this->taskDatabaseCreatorService->getDatabaseName($project->getId(), $task->getId())
        );

        $request = $this->guzzleClient->post(
            sprintf(
                'http://%s:%s@%s:%s/%s/',
                Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX . $user->getUsername(),
                $user->getCouchDbPassword(),
                $this->getContainer()->getParameter('couchdb_host'),
                $this->getContainer()->getParameter('couchdb_port'),
                $this->taskDatabaseCreatorService->getDatabaseName($project->getId(), $task->getId())
            ),
            [
                'headers' => ['Content-Type' => 'application/json'],
                'body'    => json_encode(
                    [
                        'fooo' => 'bar',
                    ]
                ),
            ]
        );

        $this->assertEquals(201, $request->getStatusCode());
    }

    public function testCreateDocumentForUnassignedUser()
    {
        $organisation = $this->organisationFacade->save(Helper\OrganisationBuilder::create()->build());
        $user         = $this->userFacade->createUser('user', 'foo@bar.com', '1234');
        $project      = $this->projectFacade->save(
            Helper\ProjectBuilder::create($organisation)->build()
        );
        $video        = $this->videoFacade->save(Helper\VideoBuilder::create($organisation)->build());
        $task         = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)->build()
        );
        $this->taskDatabaseCreatorService->createDatabase($project, $task);
        $this->taskDatabaseSecurityPermissionService->updateForTask($task);
        $this->taskDatabaseValidateDocUpdateService->updateForDatabase(
            $this->taskDatabaseCreatorService->getDatabaseName($project->getId(), $task->getId())
        );

        $request = $this->guzzleClient->post(
            sprintf(
                'http://%s:%s@%s:%s/%s/',
                Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX . $user->getUsername(),
                $user->getCouchDbPassword(),
                $this->getContainer()->getParameter('couchdb_host'),
                $this->getContainer()->getParameter('couchdb_port'),
                $this->taskDatabaseCreatorService->getDatabaseName($project->getId(), $task->getId())
            ),
            [
                'headers'     => ['Content-Type' => 'application/json'],
                'http_errors' => false,
                'body'        => json_encode(
                    [
                        'fooo' => 'bar',
                    ]
                ),
            ]
        );

        $this->assertEquals(401, $request->getStatusCode());
    }

    public function tearDownImplementation()
    {
        $this->documentManager->getCouchDBClient()->deleteDatabase($this->databaseName);
        parent::tearDownImplementation();
    }

    public function setUpImplementation()
    {
        $this->videoFacade                           = $this->getAnnostationService('database.facade.video');
        $this->projectFacade                         = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade                    = $this->getAnnostationService('database.facade.labeling_task');
        $this->organisationFacade                    = $this->getAnnostationService('database.facade.organisation');
        $this->labelingGroupFacade                   = $this->getAnnostationService('database.facade.labeling_group');
        $this->userFacade                            = $this->getAnnostationService(
            'database.facade.user.selected-alias'
        );
        $this->documentManager                       = $this->getService(
            'doctrine_couchdb.odm.default_document_manager'
        );
        $this->taskDatabaseValidateDocUpdateService  = $this->getAnnostationService(
            'service.task_database_validate_doc_update_document_service'
        );
        $this->taskDatabaseSecurityPermissionService = $this->getAnnostationService(
            'service.task_database_security_permission_service'
        );
        $this->taskDatabaseCreatorService            = $this->getAnnostationService(
            'service.task_database_creator'
        );
        $this->userRolesRebuilderService             = $this->getAnnostationService(
            'service.user_roles_rebuilder'
        );
        $this->guzzleClient                          = $this->getService('guzzle.client');

        $this->documentManager->getCouchDBClient()->createDatabase($this->databaseName);
    }
}