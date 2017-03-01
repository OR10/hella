<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use Symfony\Component\HttpFoundation;

class UserTest extends Tests\WebTestCase
{
    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    protected function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
    }

    public function testGetUsersListAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $this->createUsersForOrganisation($organisation);

        $requestWrapper = $this->createRequest('/api/user')
            ->withCredentialsFromUsername($superAdmin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetUsersListAsNonSuperAdmin()
    {
        $admin        = $this->createAdminUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $this->createUsersForOrganisation($organisation);

        $requestWrapper = $this->createRequest('/api/user')
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleUserAsSuperAdmin()
    {
        $superAdmin   = $this->createSuperAdminUser();
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test'));
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetSingleUserAsAdminInOtherOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser();
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserAsSuperAdmin()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $superAdmin   = $this->createSuperAdminUser();

        $requestWrapper = $this->createRequest('/api/user')
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

        $requestWrapper = $this->createRequest('/api/user')
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

        $requestWrapper = $this->createRequest('/api/user')
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteUserAsAdminInSameOrganisation()
    {
        $organisation = $this->organisationFacade->save(
            new AnnoStationBundleModel\Organisation('Test')
        );
        $admin        = $this->createAdminUser($organisation);
        $labeler      = $this->createLabelerUser($organisation);

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
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

        $requestWrapper = $this->createRequest('/api/user/%s', [$labeler->getId()])
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    private function createUsersForOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->createAdminUser($organisation);
        $this->createLabelerUser($organisation);
        $this->createClientUser($organisation);
        $this->createLabelCoordinatorUser($organisation);
    }
}