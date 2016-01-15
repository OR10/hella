<?php

namespace AppBundle\Tests\Controller;

use AppBundle\Tests;
use Symfony\Component\HttpFoundation;

class IndexTest extends Tests\WebTestCase
{
    const ROUTE = '/';

    protected function setUpImplementation()
    {
        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }

    public function testIndexPageRequiresLogin()
    {
        $response = $this->createRequest(self::ROUTE)->setServerParameters([])->execute()->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertEquals('/login', $response->headers->get('Location'));
    }

    public function testIndexPageWithValidLoginRedirectsToLabeling()
    {
        $response = $this->createRequest(self::ROUTE)->execute()->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertEquals('/labeling', $response->headers->get('Location'));
    }
}
