<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;

class CampaignTest extends Tests\WebTestCase
{
    /**
     * @var Facade\Campaign
     */
    private $campaignFacade;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    public function testGetCampaignsForOrganisation()
    {
        $this->campaignFacade->save(new AnnoStationBundleModel\Campaign($this->organisation, 'Test-1'));
        $this->campaignFacade->save(new AnnoStationBundleModel\Campaign($this->organisation, 'Test-2'));
        $this->campaignFacade->save(new AnnoStationBundleModel\Campaign($this->organisation, 'Test-3'));

        $requestWrapper = $this->createRequest('/api/v1/organisation/%s/campaign', [$this->organisation->getId()])
            ->execute();

        $response = array_map(
            function ($campaign) {
                return [
                    'name'           => $campaign['name'],
                    'organisationId' => $campaign['organisationId'],
                ];
            },
            $requestWrapper->getJsonResponseBody()['result']
        );

        $this->assertEquals(
            [
                ['name' => 'Test-1', 'organisationId' => $this->organisation->getId()],
                ['name' => 'Test-2', 'organisationId' => $this->organisation->getId()],
                ['name' => 'Test-3', 'organisationId' => $this->organisation->getId()],
            ],
            $response
        );
    }

    public function testAddCampaign()
    {
        $requestWrapper = $this->createRequest('/api/v1/organisation/%s/campaign', [$this->organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'name' => 'Test-4',
                ]
            )
            ->execute();

        $this->assertEquals(
            [
                ['name' => 'Test-4', 'organisationId' => $this->organisation->getId()],
            ],
            [
                [
                    'name'           => $requestWrapper->getJsonResponseBody()['result']['name'],
                    'organisationId' => $requestWrapper->getJsonResponseBody()['result']['organisationId'],
                ],
            ]
        );
    }

    protected function setUpImplementation()
    {
        $this->campaignFacade = $this->getAnnostationService('database.facade.campaign');
        $organisationFacade   = $this->getAnnostationService('database.facade.organisation');
        $this->organisation   = $organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_ADMIN]);
        $this->defaultUser->assignToOrganisation($this->organisation);
    }
}
