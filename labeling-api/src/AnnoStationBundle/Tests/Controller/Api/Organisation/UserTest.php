<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppBundleFacade;
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

    /**
     * @var AppBundleFacade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    public function testAddUserToOrganisationAsSuperAdmin()
    {
        $user       = $this->createLabelerUser($this->organisation);
        $superAdmin = $this->createSuperAdminUser($this->organisation);

        $newOrganisation = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/assign',
            [$newOrganisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $response = $requestWrapper->getJsonResponseBody();

        $this->assertEquals(['result' => ['success' => true]], $response);

        $user = $this->userFacade->getUserById($user->getId());

        $this->assertEquals(['result' => ['success' => true]], $response);
        $this->assertTrue(in_array($newOrganisation->getId(), $user->getOrganisations()));
    }

    public function testAddUserToOrganisationWithQuotaReached()
    {
        $user       = $this->createLabelerUser($this->organisation);
        $superAdmin = $this->createSuperAdminUser($this->organisation);

        $newOrganisation = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->withUserQuota(2)->build()
        );
        $user1 = $this->createLabelerUser($newOrganisation);
        $user2 = $this->createLabelerUser($newOrganisation);

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/assign',
            [$newOrganisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testAddUserToOrganisationAsLabelManager()
    {
        $user         = $this->createLabelerUser($this->organisation);
        $labelManager = $this->createLabelManagerUser($this->organisation);

        $newOrganisation = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/assign',
            [$newOrganisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testRemoveUserFromOrganisationAsSuperAdmin()
    {
        $this->markTestSkipped('This test requires a RabbitMQ Server!');

        $user       = $this->createLabelerUser($this->organisation);
        $superAdmin = $this->createSuperAdminUser($this->organisation);

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/unassign',
            [$this->organisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $response = $requestWrapper->getJsonResponseBody();

        $user = $this->userFacade->getUserById($user->getId());

        $this->assertEquals(['result' => ['success' => true]], $response);
        $this->assertFalse(in_array($this->organisation->getId(), $user->getOrganisations()));
    }

    public function testRemoveUserFromOrganisationAsLabelManager()
    {
        $this->markTestSkipped('This test requires a RabbitMQ Server!');

        $user         = $this->createLabelerUser($this->organisation);
        $labelManager = $this->createLabelManagerUser($this->organisation);

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/user/%s/unassign',
            [$this->organisation->getId(), $user->getId()]
        )
            ->withCredentialsFromUsername($labelManager)
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $response = $requestWrapper->getJsonResponseBody();

        $user = $this->userFacade->getUserById($user->getId());

        $this->assertEquals(['result' => ['success' => true]], $response);
        $this->assertFalse(in_array($this->organisation->getId(), $user->getOrganisations()));
    }

    public function testCouchDbLabelManagerRolesForOrganisation()
    {
        $superAdmin   = $this->createSuperAdminUser($this->organisation);
        $labelManager = $this->createLabelManagerUser($this->organisation);

        $newOrganisation = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $this->createRequest(
            '/api/v1/organisation/%s/user/%s/assign',
            [$newOrganisation->getId(), $labelManager->getId()]
        )
            ->withCredentialsFromUsername($superAdmin)
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $actualUser = $this->couchDbUsersFacade->getUser(
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX . $labelManager->getUsername()
        );
        $this->assertTrue(
            in_array(
                sprintf('%s%s', Service\UserRolesRebuilder::LABEL_MANAGER_PREFIX, $newOrganisation->getId()),
                $actualUser['roles']
            )
        );
    }

    protected function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->couchDbUsersFacade = $this->getAnnostationService('database.facade.couchdb_users');
        $this->organisation       = $this->organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_LABEL_MANAGER]);
        $this->defaultUser->assignToOrganisation($this->organisation);
    }
}
