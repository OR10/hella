<?php

namespace AppBundle\Tests;

use Symfony\Bundle\FrameworkBundle;

/**
 * Common base class for test cases that require a symfony client.
 */
class WebTestCase extends KernelTestCase
{
    const USERNAME = 'user';
    const PASSWORD = 'password';
    const EMAIL    = 'user@example.com';

    /**
     * Create a client for testing controllers.
     *
     * @return FrameworkBundle\Client
     */
    protected function createClient(array $server = null)
    {
        if ($server === null) {
            $server = $this->getDefaultServerParameters();
        }

        $client = $this->getService('test.client');
        $client->setServerParameters($server);

        return $client;
    }

    /**
     * @return RequestWrapper
     */
    protected function createRequest($path, array $parameters = [])
    {
        return RequestWrapper::create($this->createClient([]), vsprintf($path, $parameters))
            ->setServerParameters($this->getDefaultServerParameters());
    }

    private function getDefaultServerParameters()
    {
        return [
            'CONTENT_TYPE'  => 'application/json',
            'PHP_AUTH_USER' => self::USERNAME,
            'PHP_AUTH_PW'   => self::PASSWORD,
        ];
    }
}
