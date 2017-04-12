<?php

namespace AnnoStationBundle\Tests\Service;

use AppBundle\Model;
use AppBundle\Tests;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Tests\Helper;
use AnnoStationBundle\Database\Facade;
use GuzzleHttp;

class TaskDatabaseValidatorTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var Service\TaskDatabaseValidator
     */
    private $taskDatabaseValidatorService;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var string
     */
    private $databaseName;

    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    public function testSuperAdminPermissions()
    {
        $this->isPouchDbEnabled();

        $user = $this->createUser('superadmin');
        $user->addRole(Model\User::ROLE_SUPER_ADMIN);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(['superadmin']), $this->getDatabaseSecurityDocumentResponse());
    }

    public function testAdminPermissions()
    {
        $this->isPouchDbEnabled();

        $user = $this->createUser('admin');
        $user->addRole(Model\User::ROLE_ADMIN);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(['admin']), $this->getDatabaseSecurityDocumentResponse());

        $user->setOrganisations([]);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());
    }

    public function testClientPermissions()
    {
        $this->isPouchDbEnabled();

        $user = $this->createUser('client');
        $user->addRole(Model\User::ROLE_CLIENT);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());
    }

    public function testObserverPermissions()
    {
        $this->isPouchDbEnabled();

        $user = $this->createUser('observer');
        $user->addRole(Model\User::ROLE_OBSERVER);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(['observer']), $this->getDatabaseSecurityDocumentResponse());
    }

    public function testLabelCoordinatorPermissions()
    {
        $this->isPouchDbEnabled();

        $user = $this->createUser('label_coordinator');
        $user->addRole(Model\User::ROLE_LABEL_COORDINATOR);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());

        $this->project->addCoordinatorAssignmentHistory($user);
        $this->projectFacade->save($this->project);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals(
            $this->getExpectedResponse(['label_coordinator']),
            $this->getDatabaseSecurityDocumentResponse()
        );
    }

    public function testLabelerPermissions()
    {
        $this->isPouchDbEnabled();

        $user = $this->createUser('labeler');
        $user->addRole(Model\User::ROLE_LABELER);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());

        $labelingGroup = Helper\LabelingGroupBuilder::create($this->organisation)->build();
        $labelingGroup->setLabeler([$user->getId()]);
        $this->labelingGroupFacade->save($labelingGroup);

        $this->project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($this->project);

        $this->taskDatabaseValidatorService->updateSecurityPermissions($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(['labeler']), $this->getDatabaseSecurityDocumentResponse());
    }

    private function getExpectedResponse($memberNames = [])
    {
        return [
            'admins'  => [
                'names' => [],
                'roles' => [],
            ],
            'members' => [
                'names' => $memberNames,
                'roles' => [],
            ],
        ];
    }

    private function getDatabaseSecurityDocumentResponse()
    {
        $resource = $this->guzzleClient->request(
            'GET',
            sprintf(
                'http://%s:%s@%s:%s/%s/_security',
                $this->getContainer()->getParameter('couchdb_user'),
                $this->getContainer()->getParameter('couchdb_password'),
                $this->getContainer()->getParameter('couchdb_host'),
                $this->getContainer()->getParameter('couchdb_port'),
                $this->databaseName
            )
        );

        return json_decode($resource->getBody()->getContents(), true);
    }

    private function createUser($username)
    {
        return $this->userFacade->createUser(
            $username,
            $username . '@hella.com',
            '1234',
            true,
            false,
            [],
            [$this->organisation->getId()]
        );
    }

    private function isPouchDbEnabled()
    {
        if (!$this->getContainer()->getParameter('pouchdb_feature_enabled')){
            $this->markTestSkipped('PouchDB not enabled');
        }
    }

    public function setUpImplementation()
    {
        $this->organisationFacade           = $this->getAnnostationService('database.facade.organisation');
        $this->projectFacade                = $this->getAnnostationService('database.facade.project');
        $this->taskFacade                   = $this->getAnnostationService('database.facade.labeling_task');
        $this->videoFacade                  = $this->getAnnostationService('database.facade.video');
        $this->labelingGroupFacade          = $this->getAnnostationService('database.facade.labeling_group');
        $this->taskDatabaseCreatorService   = $this->getAnnostationService('service.task_database_creator');
        $this->taskDatabaseValidatorService = $this->getAnnostationService('service.task_database_validator');
        $this->guzzleClient                 = $this->getService('guzzle.client');

        $this->organisation = Helper\OrganisationBuilder::create()->build();
        $this->organisationFacade->save($this->organisation);
        $this->project = Helper\ProjectBuilder::create($this->organisation)->build();
        $this->projectFacade->save($this->project);
        $video = Helper\VideoBuilder::create($this->organisation)->build();
        $this->videoFacade->save($video);
        $this->labelingTask = Helper\LabelingTaskBuilder::create($this->project, $video)->build();
        $this->taskFacade->save($this->labelingTask);
        $this->taskDatabaseCreatorService->createDatabase($this->project->getId(), $this->labelingTask->getId());
        $this->databaseName = $this->taskDatabaseCreatorService->getDatabaseName(
            $this->project->getId(),
            $this->labelingTask->getId()
        );
    }
}