<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class OrganisationTest extends Tests\WebTestCase
{
    const ROUTE = '/api/v1/organisation';

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Model\User
     */
    private $superAdmin;

    /**
     * @var Model\User
     */
    private $admin;

    /**
     * @var Model\User
     */
    private $labeler;

    protected function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->superAdmin         = $this->createSuperAdminUser();
        $this->admin              = $this->createAdminUser();
        $this->labeler            = $this->createLabelerUser();
    }

    public function testGetOrganisationsAsSuperAdmin()
    {
        $this->createOrganisation('Test 1');
        $this->createOrganisation('Test 2');
        $this->createOrganisation('Test 3');
        $this->createOrganisation('Test 4');

        $requestWrapper = $this->createRequest('/api/v1/organisation')
            ->withCredentialsFromUsername($this->superAdmin)
            ->execute();

        $actualOrganisations = array_map(function($organisation) {
            return $organisation['name'];
        }, $requestWrapper->getJsonResponseBody()['result']);

        $this->assertEquals(['Test 4', 'Test 3', 'Test 2', 'Test 1'], $actualOrganisations);
    }

    public function testGetOrganisationsAsAdmin()
    {
        $organisation = $this->createOrganisation();
        $this->admin->assignToOrganisation($organisation);
        $this->createOrganisation('Test 1');
        $this->createOrganisation('Test 2');

        $requestWrapper = $this->createRequest('/api/v1/organisation')
            ->withCredentialsFromUsername($this->admin)
            ->execute();

        $actualOrganisations = array_map(
            function ($organisation) {
                return $organisation['name'];
            },
            $requestWrapper->getJsonResponseBody()['result']
        );

        $this->assertEquals(['Test Organisation'], $actualOrganisations);
    }

    public function testGetOrganisationsAsLabeler()
    {
        $requestWrapper = $this->createRequest('/api/v1/organisation')
            ->withCredentialsFromUsername($this->labeler)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testCreateOrganisation()
    {
        $requestWrapper = $this->createRequest('/api/v1/organisation')
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->superAdmin)
            ->setJsonBody(
                [
                    'name' => 'Test create new organisation',
                ]
            )
            ->execute();

        $organisation = $requestWrapper->getJsonResponseBody()['result'];
        $this->assertEquals('Test create new organisation', $organisation['name']);
    }

    public function testCreateOrganisationAsNonSuperAdmin()
    {
        $requestWrapper = $this->createRequest('/api/v1/organisation')
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->admin)
            ->setJsonBody(
                [
                    'name' => 'Test create new organisation',
                ]
            )
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testUpdateOrganisation()
    {
        $organisation   = $this->createOrganisation();
        $requestWrapper = $this->createRequest('/api/v1/organisation/%s', [$organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->withCredentialsFromUsername($this->superAdmin)
            ->setJsonBody(
                [
                    'name' => 'Test Organisation Updated',
                    'rev'  => $organisation->getRev(),
                ]
            )
            ->execute();

        $organisation = $requestWrapper->getJsonResponseBody()['result'];
        $this->assertEquals('Test Organisation Updated', $organisation['name']);
    }

    public function testUpdateOrganisationAsNonSuperAdmin()
    {
        $organisation   = $this->createOrganisation();
        $requestWrapper = $this->createRequest('/api/v1/organisation/%s', [$organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->withCredentialsFromUsername($this->admin)
            ->setJsonBody(
                [
                    'name' => 'Test Organisation Updated',
                    'rev'  => $organisation->getRev(),
                ]
            )
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testDeleteOrganisation()
    {
        $organisation   = $this->createOrganisation();
        $requestWrapper = $this->createRequest('/api/v1/organisation/%s', [$organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->withCredentialsFromUsername($this->superAdmin)
            ->execute();

        $this->assertNull($this->organisationFacade->find($organisation->getId()));
    }

    public function testDeleteOrganisationAsNonSuperAdmin()
    {
        $organisation   = $this->createOrganisation();
        $requestWrapper = $this->createRequest('/api/v1/organisation/%s', [$organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->withCredentialsFromUsername($this->admin)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    private function createOrganisation($name = 'Test Organisation')
    {
        return $this->organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->withName($name)->build());
    }
}
