<?php

namespace crosscan\RabbitMQ;

use PhpAmqpLib\Connection\AMQPStreamConnection;

/**
 * The SetupHelper class can be used to set up a rabbitmq instance.
 * If no value for the constructor parameter $virtualHost is given, it will generate a random name and
 * try to create the virtual host.
 * Using addQueue and addExchange one can add queues and exchanges which will be created when setup() is called.
 * Calling teardown() destroys the virtualhost
 */
class SetupHelper
{
    /**
     * @var string
     */
    private $username;

    /**
     * @var string
     */
    private $password;

    /**
     * @var string
     */
    private $host;

    /**
     * @var int
     */
    private $amqpPort;

    /**
     * @var int
     */
    private $webApiPort;

    /**
     * @var string
     */
    private $virtualHost;

    /**
     * @var Queue[]
     */
    private $queues = array();

    /**
     * @var Exchange[]
     */
    private $exchanges = array();

    /**
     * @var \PhpAmqpLib\Connection\AMQPStreamConnection
     */
    private $connection;

    /**
     * @param string $username
     * @param string $password
     * @param string $host
     * @param int    $amqpPort
     * @param int    $webApiPort
     * @param null   $virtualHost
     */
    public function __construct(
        $username = 'guest',
        $password = 'guest',
        $host = '127.0.0.1',
        $amqpPort = 5672,
        $webApiPort = 15672,
        $virtualHost = null
    ) {
        $this->username   = $username;
        $this->password   = $password;
        $this->host       = $host;
        $this->amqpPort   = $amqpPort;
        $this->webApiPort = $webApiPort;

        if ($virtualHost === null) {
            $this->virtualHost = md5(mt_rand());
        } else {
            $this->virtualHost = $virtualHost;
        }

        $this->createVirtualHost();

        $this->connection = new AMQPStreamConnection(
            $this->host,
            $this->amqpPort,
            $this->username,
            $this->password,
            $this->virtualHost
        );
    }

    /**
     * Adds an exchange creation request to be executed when setUp() is called.
     * Optionally the name of another exchange as well as a routingkey can be passed
     * to create an exchange-to-exchange-binding
     *
     * @param      $exchangeName
     * @param bool $durable
     * @param bool $autoDelete
     * @param null $otherExchange
     * @param null $routingKey
     */
    public function addExchange(Exchange $exchange)
    {
        $this->exchanges[] = $exchange;
    }

    /**
     * @param Queue $queue
     */
    public function addQueue(Queue $queue)
    {
        $this->queues[] = $queue;
    }

    public function getVirtualHost()
    {
        return $this->virtualHost;
    }

    /**
     * Creates the virtual host as well es the added exchanges and queues
     */
    public function setup()
    {
        $channel = $this->createChannel();

        foreach ($this->exchanges as $exchange) {
            $exchange->create($channel);
        }

        foreach ($this->queues as $queue) {
            $queue->create($channel, $queue);
        }
    }

    /**
     *
     */
    public function tearDown()
    {
        $this->destroyVirtualHost();
    }

    /**
     * @return \PhpAmqpLib\Channel\AMQPChannel
     */
    private function createChannel()
    {
        return $this->connection->channel();
    }

    /**
     * @throws \RuntimeException
     */
    private function destroyVirtualHost()
    {
        if (urldecode($this->virtualHost === '/')) {
            return;
        }

        $curlSession = curl_init(sprintf('http://%s/api/vhosts/%s', $this->host, $this->virtualHost));
        curl_setopt_array(
            $curlSession,
            array(
                CURLOPT_PORT          => $this->webApiPort,
                CURLOPT_CUSTOMREQUEST => 'DELETE',
                // yes. we need this header although we have no content to transfer
                CURLOPT_HTTPHEADER    => array(
                    'Content-type: application/json',
                    'Authorization: Basic ' . base64_encode(sprintf('%s:%s', $this->username, $this->password))
                ),
            )
        );
        $result   = curl_exec($curlSession);
        $httpCode = curl_getinfo($curlSession, CURLINFO_HTTP_CODE);

        if ($result === false || $httpCode < 200 || $httpCode >= 400) {
            throw new \RuntimeException(
                sprintf(
                    'Error trying to delete RabbitMQ-vhost %s: (%s) %s',
                    $this->virtualHost,
                    curl_errno($curlSession),
                    curl_error($curlSession)
                )
            );
        }
    }

    /**
     * @throws \RuntimeException
     */
    private function createVirtualHost()
    {
        $curlSession = curl_init(sprintf('http://%s/api/vhosts/%s', $this->host, $this->virtualHost));
        curl_setopt_array(
            $curlSession,
            array(
                CURLOPT_PORT           => $this->webApiPort,
                CURLOPT_CUSTOMREQUEST  => 'PUT',
                // yes. we need this header although we have no content to transfer
                CURLOPT_HTTPHEADER     => array(
                    'Content-type: application/json',
                    "Authorization: Basic " . base64_encode(sprintf('%s:%s', $this->username, $this->password)),
                ),
                CURLOPT_RETURNTRANSFER => true,
            )
        );
        $result   = curl_exec($curlSession);
        $httpCode = curl_getinfo($curlSession, CURLINFO_HTTP_CODE);

        if ($result === false || $httpCode < 200 || $httpCode >= 400) {
            throw new \RuntimeException(
                sprintf(
                    'Error trying to create RabbitMQ-vhost %s: (%s) %s',
                    $this->virtualHost,
                    curl_errno($curlSession),
                    curl_error($curlSession)
                )
            );
        }

        $curlSession = curl_init(
            sprintf(
                'http://%s/api/permissions/%s/%s',
                $this->host,
                $this->virtualHost,
                $this->username
            )
        );
        curl_setopt_array(
            $curlSession,
            array(
                CURLOPT_PORT           => $this->webApiPort,
                CURLOPT_CUSTOMREQUEST  => 'PUT',
                CURLOPT_HTTPHEADER     => array(
                    'Content-type: application/json',
                    "Authorization: Basic " . base64_encode(sprintf('%s:%s', $this->username, $this->password)),
                ),
                CURLOPT_POSTFIELDS     => '{"configure":".*","write":".*","read":".*"}',
                CURLOPT_RETURNTRANSFER => true,
            )
        );
        $result   = curl_exec($curlSession);
        $httpCode = curl_getinfo($curlSession, CURLINFO_HTTP_CODE);

        if ($result === false || $httpCode < 200 || $httpCode >= 400) {
            throw new \RuntimeException(
                sprintf(
                    'Error trying to set permissions for RabbitMQ-vhost %s: (%s) %s',
                    $this->virtualHost,
                    curl_errno($curlSession),
                    curl_error($curlSession)
                )
            );
        }
    }
}
