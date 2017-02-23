<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class OrganisationTest extends Tests\WebTestCase
{
    const ROUTE = '/api/organisation';

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Model\User
     */
    private $superAdmin;

    protected function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->superAdmin         = $this->createSuperAdminUser();
    }

    public function testGetOrganisations()
    {
        $this->createOrganisation('Test 1');
        $this->createOrganisation('Test 2');
        $this->createOrganisation('Test 3');
        $this->createOrganisation('Test 4');

        $requestWrapper = $this->createRequest('/api/organisation')
            ->withCredentialsFromUsername($this->superAdmin)
            ->execute();

        $actualOrganisations = array_map(function($organisation) {
            return $organisation['name'];
        }, $requestWrapper->getJsonResponseBody()['result']);

        $this->assertEquals(['Test 4', 'Test 3', 'Test 2', 'Test 1'], $actualOrganisations);
    }

    public function testCreateOrganisation()
    {
        $requestWrapper = $this->createRequest('/api/organisation')
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->superAdmin)
            ->setJsonBody(
                [
                    'name' => 'Test create new organisation',
                ]
            )
            ->execute();

        $organisation = $requestWrapper->getJsonResponseBody();
        $this->assertEquals('Test create new organisation', $organisation['name']);
    }

    public function testUpdateOrganisation()
    {
        $organisation   = $this->createOrganisation();
        $requestWrapper = $this->createRequest('/api/organisation/%s', [$organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->withCredentialsFromUsername($this->superAdmin)
            ->setJsonBody(
                [
                    'name' => 'Test Organisation Updated',
                    'rev'  => $organisation->getRev(),
                ]
            )
            ->execute();

        $organisation = $requestWrapper->getJsonResponseBody();
        $this->assertEquals('Test Organisation Updated', $organisation['name']);
    }

    public function testDeleteOrganisation()
    {
        $organisation   = $this->createOrganisation();
        $requestWrapper = $this->createRequest('/api/organisation/%s', [$organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->withCredentialsFromUsername($this->superAdmin)
            ->execute();

        $this->assertNull($this->organisationFacade->find($organisation->getId()));
    }

    private function createOrganisation($name = 'Test Organisation')
    {
        return $this->organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->withName($name)->build());
    }
}