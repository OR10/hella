<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation;

use AnnoStationBundle\Tests;
use AppBundle\Model as AppBundleModel;
use AnnoStationBundle\Model;
use Symfony\Component\HttpFoundation;

class TaskConfigurationTest extends Tests\WebTestCase
{
    /**
     * @var Model\Organisation
     */
    private $organisation;

    /**
     * @var AppBundleModel\User
     */
    private $labelManager;

    public function testInvalidDuplicateId()
    {
        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/taskConfiguration/requirements',
            [$this->organisation->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
            ->setJsonBody(['name' => 'some_config'])
            ->setFiles(
                [
                    'file' => new HttpFoundation\File\UploadedFile(
                        __DIR__ . '/../../../Resources/TaskConfigurations/requirements_invalid_duplicate_ids.xml',
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

        $this->labelManager = $this->createLabelManagerUser($this->organisation);
    }
}
