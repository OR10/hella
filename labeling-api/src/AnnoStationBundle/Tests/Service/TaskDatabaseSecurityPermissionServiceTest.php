<?php

namespace AnnoStationBundle\Tests\Service;

use AppBundle\Model;
use AppBundle\Tests;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Tests\Helper;
use AnnoStationBundle\Database\Facade;
use GuzzleHttp;

class TaskDatabaseSecurityPermissionServiceTest extends Tests\KernelTestCase
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
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $taskDatabaseSecurityPermissionService;

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
        $user = $this->createUser('superadmin');
        $user->addRole(Model\User::ROLE_SUPER_ADMIN);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseSecurityPermissionService->updateForTask($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());
    }

    public function testObserverPermissions()
    {
        $user = $this->createUser('observer');
        $user->addRole(Model\User::ROLE_OBSERVER);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseSecurityPermissionService->updateForTask($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());
    }

    public function testLabelLabelManagerPermissions()
    {
        $user = $this->createUser('label_manager');
        $user->addRole(Model\User::ROLE_LABEL_MANAGER);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseSecurityPermissionService->updateForTask($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());

        $this->project->addLabelManagerAssignmentHistory($user);
        $this->projectFacade->save($this->project);

        $this->taskDatabaseSecurityPermissionService->updateForTask($this->labelingTask);

        $this->assertEquals(
            $this->getExpectedResponse(),
            $this->getDatabaseSecurityDocumentResponse()
        );
    }

    public function testLabelerPermissions()
    {
        $user = $this->createUser('labeler');
        $user->addRole(Model\User::ROLE_LABELER);
        $this->userFacade->saveUser($user);

        $this->taskDatabaseSecurityPermissionService->updateForTask($this->labelingTask);

        $this->assertEquals($this->getExpectedResponse(), $this->getDatabaseSecurityDocumentResponse());

        $labelingGroup = Helper\LabelingGroupBuilder::create($this->organisation)->build();
        $labelingGroup->setLabeler([$user->getId()]);
        $this->labelingGroupFacade->save($labelingGroup);

        $this->project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($this->project);

        $this->taskDatabaseSecurityPermissionService->updateForTask($this->labelingTask);

        $this->assertEquals(
            $this->getExpectedResponse(
                [],
                [sprintf('%s%s', Service\TaskDatabaseSecurityPermissionService::LABELGROUP_PREFIX, $labelingGroup->getId())]
            ),
            $this->getDatabaseSecurityDocumentResponse()
        );
    }

    private function getExpectedResponse($memberNames = [], $memberRoles = [])
    {
        $fixedMemberNames = [$this->getContainer()->getParameter('couchdb_user_read_only')];
        $fixedRoles       = [
            sprintf(
                '%s%s-%s',
                Service\UserRolesRebuilder::LABEL_MANAGER_PREFIX,
                $this->organisation->getId(),
                $this->project->getId()
            ),
            Service\UserRolesRebuilder::SUPER_ADMIN_GROUP,
            sprintf('%s%s', Service\UserRolesRebuilder::LABEL_MANAGER_PREFIX, $this->organisation->getId()),
            sprintf('%s%s', Service\UserRolesRebuilder::OBSERVER_GROUP_PREFIX, $this->organisation->getId()),
        ];
        $memberNames      = array_merge($memberNames, $fixedMemberNames);
        $roles            = array_merge($memberRoles, $fixedRoles);
        sort($memberNames);
        sort($roles);

        return [
            'admins'          => [
                'names' => [],
                'roles' => [],
            ],
            'members'         => [
                'names' => $memberNames,
                'roles' => $roles,
            ],
            'assignedLabeler' => null,
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

    public function setUpImplementation()
    {
        $this->organisationFacade           = $this->getAnnostationService('database.facade.organisation');
        $this->projectFacade                = $this->getAnnostationService('database.facade.project');
        $this->taskFacade                   = $this->getAnnostationService('database.facade.labeling_task');
        $this->videoFacade                  = $this->getAnnostationService('database.facade.video');
        $this->labelingGroupFacade          = $this->getAnnostationService('database.facade.labeling_group');
        $this->taskDatabaseCreatorService   = $this->getAnnostationService('service.task_database_creator');
        $this->taskDatabaseSecurityPermissionService = $this->getAnnostationService('service.task_database_security_permission_service');
        $this->guzzleClient                 = $this->getService('guzzle.client');

        $this->organisation = Helper\OrganisationBuilder::create()->build();
        $this->organisationFacade->save($this->organisation);
        $this->project = Helper\ProjectBuilder::create($this->organisation)->build();
        $this->projectFacade->save($this->project);
        $video = Helper\VideoBuilder::create($this->organisation)->build();
        $this->videoFacade->save($video);
        $this->labelingTask = Helper\LabelingTaskBuilder::create($this->project, $video)->build();
        $this->taskFacade->save($this->labelingTask);
        $this->taskDatabaseCreatorService->createDatabase($this->project, $this->labelingTask);
        $this->databaseName = $this->taskDatabaseCreatorService->getDatabaseName(
            $this->project->getId(),
            $this->labelingTask->getId()
        );
    }
}
