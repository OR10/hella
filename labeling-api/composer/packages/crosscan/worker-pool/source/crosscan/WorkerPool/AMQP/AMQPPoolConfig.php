<?php

namespace crosscan\WorkerPool\AMQP;

use PhpAmqpLib\Connection;

/**
 * Class AMQPPoolConfig
 *
 * @property-read string $workerMainExchange
 * @property-read string $workerHighPrioRoutingKey
 * @property-read string $workerNormalPrioRoutingKey
 * @property-read string $workerLowPrioRoutingKey
 * @property-read string $workerAlternateExchange
 * @property-read string $workerDeadLetterExchange
 * @property-read string $rescheduleQueue
 * @property-read string $username
 * @property-read string $password
 * @property-read string $host
 * @property-read int    $port
 * @property-read string $vhost
 * @property-read int    $webApiPort
 */
class AMQPPoolConfig
{
    public $numberOfHighNormalWorkers = 8;
    public $numberOfLowNormalWorkers  = 2;

    public $host       = '127.0.0.1';
    public $port       = 5672;
    public $vhost      = '/';
    public $webApiPort = 15672;

    public $heartBeatSeconds = 15;

    private $username = 'guest';
    private $password = 'guest';

    public $useAlternateExchange  = true;
    public $useDeadLetterExchange = true;

    public $instructionInstances = array();

    private $workerAlternateExchange  = 'worker.garbage-collection';
    private $workerDeadLetterExchange = 'worker.garbage-collection';
    private $rescheduleQueue          = 'worker.reschedule';

    private $workerMainExchange         = 'worker.main.exchange';
    private $workerHighPrioRoutingKey   = 'worker.queue.high_prio';
    private $workerNormalPrioRoutingKey = 'worker.queue.normal_prio';
    private $workerLowPrioRoutingKey    = 'worker.queue.low_prio';

    /**
     * @param $name
     * @return mixed
     */
    public function __get($name)
    {
        return $this->$name;
    }

    /**
     * @param $name
     * @param $value
     */
    public function __set($name, $value)
    {
        $this->$name = $value;
    }

    public function __construct()
    {
        ini_set('amqp.auto_ack', 0);
        ini_set('amqp.min_messages', 0);
        ini_set('amqp.max_messages', 1);
        ini_set('amqp.prefetch_count', 1);
    }

    /**
     * used to create an array \AMQPConnection#__construct accepts as parameter
     *
     * @return array
     */
    public function asArray()
    {
        return array(
            'host'     => $this->host,
            'port'     => $this->port,
            'vhost'    => $this->vhost,
            'login'    => $this->username,
            'password' => $this->password,
        );
    }

    /**
     * @return Connection\AMQPStreamConnection
     */
    public function openConnection()
    {
        $connection = new Connection\AMQPStreamConnection(
            $this->host,
            $this->port,
            $this->username,
            $this->password,
            $this->vhost,
            false,
            'AMQPLAIN',
            null,
            'en_US',
            3.0,
            // we cannot use the default of 3.0 here anymore as since 2.6.3 the read_write_timeout has to be at
            // least the heartbeat * 2
            max(3.0, $this->heartBeatSeconds * 2),
            null,
            false,
            $this->heartBeatSeconds
        );

        return $connection;
    }
}
