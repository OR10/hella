<?php

namespace AnnoStationBundle\Tests;

use Symfony\Bundle\FrameworkBundle;

/**
 * Common base class for test cases that require a symfony client.
 * @SuppressWarnings(PHPMD.NumberOfChildren)
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
     * @param null   $username
     * @param null   $password
     *
     * @return RequestWrapper
     */
    protected function createRequest(string $path, array $parameters = [], $username = null, $password = null)
    {
        return RequestWrapper::create($this->createClient([]), vsprintf($path, $parameters))
            ->setServerParameters($this->getDefaultServerParameters($username, $password));
    }

    /**
     * @param null $username
     * @param null $password
     *
     * @return array
     */
    private function getDefaultServerParameters($username = null, $password = null)
    {
        return [
            'CONTENT_TYPE'  => 'application/json',
            'HTTP_ACCEPT'   => 'application/json',
            'PHP_AUTH_USER' => $username === null ? self::USERNAME : $username,
            'PHP_AUTH_PW'   => $password === null ? self::PASSWORD : $password,
        ];
    }
}
