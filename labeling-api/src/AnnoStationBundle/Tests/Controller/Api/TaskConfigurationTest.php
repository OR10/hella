<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use Symfony\Component\HttpFoundation;

class TaskConfigurationTest extends Tests\WebTestCase
{
    public function testInvalidDuplicateId()
    {
        $requestWrapper = $this->createRequest('/api/taskConfiguration/requirements', [])
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
        $userManipulator = $this->getService('fos_user.util.user_manipulator');

        $user = $userManipulator
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}