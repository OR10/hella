<?php

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class IndexTest extends WebTestCase
{
    public function testIndexPageRequiresLogin()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/');

        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
        $this->assertEquals('http://localhost/login', $response->headers->get('Location'));
    }

    public function testIndexPageWithValidLogin()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/', [], [], [
            'PHP_AUTH_USER' => 'user',
            'PHP_AUTH_PW'   => 'password',
        ]);

        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
    }
}
