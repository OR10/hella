<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Model;
use Symfony\Component\HttpFoundation;

class TaskConfigurationTest extends Tests\WebTestCase
{
    /**
     * @var Model\Organisation
     */
    private $organisation;

    public function testInvalidDuplicateId()
    {
        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/taskConfiguration/requirements',
            [$this->organisation->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(['name' => 'some_config'])
            ->setFiles(
                [
                    'file' => new HttpFoundation\File\UploadedFile(
                        __DIR__ . '/../../Resources/TaskConfigurations/requirements_invalid_duplicate_ids.xml',
                        'requirements_invalid_duplicate_ids.xml'
                    ),
                ]
            )
            ->execute();

        $this->assertEquals(406, $requestWrapper->getResponse()->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->organisation = $organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());

        $this->createDefaultUser();
        $this->defaultUser->assignToOrganisation($this->organisation);
    }
}
