<?php

namespace AnnoStationBundle\Tests\Controller\Api\Api;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\Database\Facade  as AppBundleFacade;
use Symfony\Component\HttpFoundation;

class UserTest extends Tests\WebTestCase
{
    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var AppBundleFacade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    protected function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->couchDbUsersFacade = $this->getAnnostationService('database.facade.couchdb_users');
    }

    public function testGetUsersListAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $this->createUsersForOrganisation($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($superAdmin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetUsersListAsNonSuperAdmin()
    {
        $labelManager = $this->createLabelManagerUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $this->createUsersForOrganisation($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($labelManager)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleUserAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($superAdmin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleUserAsLabelManagerInSameOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleLabelUserAsLabelManagerInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser();
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleSuperAdminUserAsLabelManagerInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser();
        $superAdmin   = $this->createSuperAdminUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$superAdmin->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleSuperAdminUserAsLabelerInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createLabelerUser();
        $superAdmin   = $this->createSuperAdminUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$superAdmin->getId()])
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '12345!',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserAsLabelManagerAndSameOrganisationAssignment()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '12345!',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());

        $newUser = $requestWrapper->getJsonResponseBody();

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/assign',
            [
                $organisation->getId(),
                $newUser['result']['user']['id']
            ]
        )->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();
        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());

    }

    public function testAddUserAsLabelManagerInOtherOrganisation()
    {
        $labelManager = $this->createlabelManagerUser();

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '12345!',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                ]
            )
            ->execute();

        $newUser = $requestWrapper->getJsonResponseBody();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());

        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/assign',
            [
                $organisation->getId(),
                $newUser['result']['user']['id']
            ]
        )->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '12345!',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserAsLabelManagerInSameOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '12345!',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserAsLabelManagerInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createlabelManagerUser($organisation);
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '12345!',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsLabelManagerInSameOrganisation()
    {
        $this->markTestSkipped('This test requires a RabbitMQ Server!');

        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsLabelManagerInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $labelManager = $this->createLabelManagerUser($organisation);
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testSuperAdminCouchDbRoles()
    {
        $superAdmin   = $this->createSuperAdminUser();

        $username = 'super_admin_2';
        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => $username,
                    'email'           => 'superadmin@example.org',
                    'password'        => 'password@1',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_SUPER_ADMIN],
                ]
            )
            ->execute();

        $actualUser = $this->couchDbUsersFacade->getUser(
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX . $username
        );

        $this->assertTrue(in_array(Service\UserRolesRebuilder::SUPER_ADMIN_GROUP, $actualUser['roles']));
    }

    private function createUsersForOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->createLabelerUser($organisation);
        $this->createLabelManagerUser($organisation);
    }
}
