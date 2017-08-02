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
        $admin        = $this->createAdminUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $this->createUsersForOrganisation($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($admin)
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

    public function testGetSingleUserAsAdminInSameOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleLabelUserAsAdminInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser();
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleSuperAdminUserAsAdminInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser();
        $superAdmin   = $this->createSuperAdminUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$superAdmin->getId()])
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserAsSuperAdmin()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $superAdmin   = $this->createSuperAdminUser();

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisation->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserAsAdminInSameOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisation->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserAsAdminInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser();

        $requestWrapper = $this->createRequest('/api/v1/user')
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisation->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserAsSuperAdmin()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $superAdmin   = $this->createSuperAdminUser();
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisation->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserAsAdminInSameOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisation->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserToOtherOrganisationAsAdminInSameOrganisation()
    {
        $organisation    = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $organisationNew = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin           = $this->createAdminUser($organisation);
        $labeler         = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisationNew->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateUserAsAdminInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'username'        => 'Labeler',
                    'email'           => 'labeler@example.org',
                    'password'        => '1234',
                    'enabled'         => 'true',
                    'locked'          => 'false',
                    'roles'           => [Model\User::ROLE_LABELER],
                    'organisationIds' => [$organisation->getId()],
                ]
            )
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsSuperAdmin()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $superAdmin   = $this->createSuperAdminUser();
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsAdminInSameOrganisation()
    {
        $this->markTestSkipped('This test requires a RabbitMQ Server!');

        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsAdminInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);
        $labeler      = $this->createLabelerUser();

        $requestWrapper = $this->createRequest('/api/v1/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
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
        $this->createAdminUser($organisation);
        $this->createLabelerUser($organisation);
        $this->createClientUser($organisation);
        $this->createLabelCoordinatorUser($organisation);
    }
}
