<?php

namespace AppBundle\Tests\Controller;

use AppBundle\Tests;

class IndexTest extends Tests\WebTestCase
{
    const USERNAME = 'user';
    const PASSWORD = 'password';
    const EMAIL    = 'user@example.com';

    protected function setUpImplementation()
    {
        $userManipulator = static::$kernel->getContainer()->get('fos_user.util.user_manipulator');

        $userManipulator->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }

    public function testIndexPageRequiresLogin()
    {
        $client = $this->createClient();

        $crawler = $client->request('GET', '/');
        $response = $client->getResponse();

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertEquals('http://localhost/login', $response->headers->get('Location'));
    }

    public function testIndexPageWithValidLoginRedirectsToLabeling()
    {
        $client = $this->createClient();

        $crawler = $client->request('GET', '/', [], [], [
            'PHP_AUTH_USER' => self::USERNAME,
            'PHP_AUTH_PW'   => self::PASSWORD,
        ]);
        $response = $client->getResponse();

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertEquals('/labeling', $response->headers->get('Location'));
    }
}
