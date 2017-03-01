<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;

class UserTest extends Tests\WebTestCase
{
    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    public function testAddUserToOrganisationAsSuperAdmin()
    {
        $user       = $this->createLabelerUser($this->organisation);
        $superAdmin = $this->createSuperAdminUser($this->organisation);

        $newOrganisation = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/user/%s/assign',
            [$newOrganisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $response = $requestWrapper->getJsonResponseBody();

        $this->assertEquals(['success' => true], $response);

        $user = $this->userFacade->getUserById($user->getId());

        $this->assertEquals(['success' => true], $response);
        $this->assertTrue(in_array($newOrganisation->getId(), $user->getOrganisations()));
    }

    public function testAddUserToOrganisationAsAdmin()
    {
        $user  = $this->createLabelerUser($this->organisation);
        $admin = $this->createAdminUser($this->organisation);

        $newOrganisation = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/user/%s/assign',
            [$newOrganisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testRemoveUserFromOrganisationAsSuperAdmin()
    {
        $user       = $this->createLabelerUser($this->organisation);
        $superAdmin = $this->createSuperAdminUser($this->organisation);

        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/user/%s/unassign',
            [$this->organisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $response = $requestWrapper->getJsonResponseBody();

        $user = $this->userFacade->getUserById($user->getId());

        $this->assertEquals(['success' => true], $response);
        $this->assertFalse(in_array($this->organisation->getId(), $user->getOrganisations()));
    }

    public function testRemoveUserFromOrganisationAsAdmin()
    {
        $user  = $this->createLabelerUser($this->organisation);
        $admin = $this->createAdminUser($this->organisation);

        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/user/%s/unassign',
            [$this->organisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($admin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $response = $requestWrapper->getJsonResponseBody();

        $user = $this->userFacade->getUserById($user->getId());

        $this->assertEquals(['success' => true], $response);
        $this->assertFalse(in_array($this->organisation->getId(), $user->getOrganisations()));
    }

    protected function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->organisation       = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_ADMIN]);
        $this->defaultUser->assignToOrganisation($this->organisation);
    }
}