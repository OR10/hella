<?php

namespace AppBundle\Tests;

/**
 * Common base class for test cases that require a symfony client.
 */
class WebTestCase extends KernelTestCase
{
    /**
     * Create a client for testing controllers.
     *
     * @return \Symfony\Bundle\FrameworkBundle\Client
     */
    protected function createClient(array $server = [])
    {
        $client = static::$kernel->getContainer()->get('test.client');
        $client->setServerParameters($server);

        return $client;
    }
}
