<?php
namespace AppBundle\Service;

use \crosscan\WorkerPool\AMQP;

class AmqpPoolConfig extends AMQP\AMQPPoolConfig
{
    /**
     * AMQPPoolConfig constructor.
     * @param int       $numberOfHighNormalWorkers
     * @param int       $numberOfLowNormalWorkers
     * @param string    $host
     * @param int       $port
     * @param string    $vhost
     * @param string    $username
     * @param string    $password
     * @param bool|true $useDeadLetterExchange
     * @param bool|true $useAlternateExchange
     */
    public function __construct(
        $numberOfHighNormalWorkers = 8,
        $numberOfLowNormalWorkers = 2,
        $host = 'localhost',
        $port = 5672,
        $vhost = '/',
        $username = 'guest',
        $password = 'guest',
        $useDeadLetterExchange = true,
        $useAlternateExchange = true
    )
    {
        parent::__construct();

        $this->numberOfHighNormalWorkers = $numberOfHighNormalWorkers;
        $this->numberOfLowNormalWorkers  = $numberOfLowNormalWorkers;
        $this->host                      = $host;
        $this->port                      = $port;
        $this->vhost                     = $vhost;
        $this->username                  = $username;
        $this->password                  = $password;
        $this->useDeadLetterExchange     = $useDeadLetterExchange;
        $this->useAlternateExchange      = $useAlternateExchange;

        $this->instructionInstances = array(
            'AppBundle\Worker\Jobs\Video' => 'annostation.labeling_api.worker.job_instruction.video',
        );
    }
}