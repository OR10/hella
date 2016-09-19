<?php

namespace AppBundle\Tests;

use Symfony\Bundle\FrameworkBundle;

/**
 * Common base class for test cases that require a symfony client.
 */
class WebTestCase extends KernelTestCase
{
    /**
     * Create a client for testing controllers.
     *
     * @param array $server
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
     * @param string $path
     * @param array  $parameters
     *
     * @return RequestWrapper
     */
    protected function createRequest(string $path, array $parameters = [])
    {
        return RequestWrapper::create($this->createClient([]), vsprintf($path, $parameters))
            ->setServerParameters($this->getDefaultServerParameters());
    }

    /**
     * @return array
     */
    private function getDefaultServerParameters()
    {
        return [
            'CONTENT_TYPE'  => 'application/json',
            'HTTP_ACCEPT'   => 'application/json',
            'PHP_AUTH_USER' => self::USERNAME,
            'PHP_AUTH_PW'   => self::PASSWORD,
        ];
    }
}
