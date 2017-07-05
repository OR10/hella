<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AppBundle\Tests;
use AnnoStationBundle\Tests\Helper;
use GuzzleHttp;

class UserRolesRebuilderTest extends Tests\KernelTestCase
{
    /**
     * @var Service\UserRolesRebuilder
     */
    private $UserRolesRebuilderService;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    public function setUpImplementation()
    {
        $organisationFacade        = $this->getAnnostationService('database.facade.organisation');
        $this->projectFacade       = $this->getAnnostationService('database.facade.project');
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');
        $this->userFacade          = $this->getAnnostationService('database.facade.user_with_couch_db_sync');
        $this->guzzleClient        = $this->getService('guzzle.client');

        $this->UserRolesRebuilderService = $this->getAnnostationService('service.user_roles_rebuilder');

        $this->organisation = Helper\OrganisationBuilder::create()->build();
        $organisationFacade->save($this->organisation);
        $project = Helper\ProjectBuilder::create($this->organisation)->build();
        $this->projectFacade->save($project);
    }

    public function testUserWithNoLabelingGroup()
    {
        $user = $this->userFacade->createUser('foobar', 'mail@foo.bar', '1234');
        $this->UserRolesRebuilderService->rebuildForUser($user);

        $this->assertEquals([], $this->getUserCouchDbRoles($user->getUsername()));
    }

    public function testUserWithLabelingGroup()
    {
        $user = $this->userFacade->createUser('foobar', 'mail@foo.bar', '1234');

        $labelingGroup = Helper\LabelingGroupBuilder::create($this->organisation)->withUsers([$user->getId()])->build();
        $this->labelingGroupFacade->save($labelingGroup);

        $this->UserRolesRebuilderService->rebuildForUser($user);

        $this->assertEquals(
            [sprintf('%s%s', Service\UserRolesRebuilder::LABELGROUP_PREFIX, $labelingGroup->getId())],
            $this->getUserCouchDbRoles($user->getUsername())
        );
    }

    public function testRemoveUserFromLabelingGroup()
    {
        $user = $this->userFacade->createUser('foobar', 'mail@foo.bar', '1234');

        $labelingGroup = Helper\LabelingGroupBuilder::create($this->organisation)->withUsers([$user->getId()])->build();
        $this->labelingGroupFacade->save($labelingGroup);

        $this->UserRolesRebuilderService->rebuildForUser($user);

        $this->assertEquals(
            [sprintf('%s%s', Service\UserRolesRebuilder::LABELGROUP_PREFIX, $labelingGroup->getId())],
            $this->getUserCouchDbRoles($user->getUsername())
        );

        $labelingGroup->setLabeler([]);
        $this->labelingGroupFacade->save($labelingGroup);
        $this->UserRolesRebuilderService->rebuildForUser($user);

        $this->assertEquals([], $this->getUserCouchDbRoles($user->getUsername()));
    }

    private function getUserCouchDbRoles($username)
    {
        $resource = $this->guzzleClient->request(
            'GET',
            sprintf(
                'http://%s:%s@%s:%s/_users/org.couchdb.user:%s%s',
                $this->getContainer()->getParameter('couchdb_user'),
                $this->getContainer()->getParameter('couchdb_password'),
                $this->getContainer()->getParameter('couchdb_host'),
                $this->getContainer()->getParameter('couchdb_port'),
                Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX,
                $username
            )
        );

        return json_decode($resource->getBody()->getContents(), true)['roles'];
    }
}