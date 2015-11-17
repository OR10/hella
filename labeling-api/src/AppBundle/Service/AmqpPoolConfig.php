<?php
namespace AppBundle\Service;

use \crosscan\WorkerPool\AMQP;

class AmqpPoolConfig extends AMQP\AMQPPoolConfig
{
    /**
     * AMQPPoolConfig constructor.
     * @param string    $host
     * @param int       $port
     * @param string    $vhost
     * @param string    $username
     * @param string    $password
     * @param bool|true $useDeadLetterExchange
     * @param bool|true $useAlternateExchange
     */
    public function __construct(
        $host = 'localhost',
        $port = 5672,
        $vhost = '/',
        $username = 'guest',
        $password = 'guest',
        $useDeadLetterExchange = true,
        $useAlternateExchange = true
    ) {
        parent::__construct();

        $this->host                      = $host;
        $this->port                      = $port;
        $this->vhost                     = $vhost;
        $this->username                  = $username;
        $this->password                  = $password;
        $this->useDeadLetterExchange     = $useDeadLetterExchange;
        $this->useAlternateExchange      = $useAlternateExchange;

        $this->instructionInstances = array(
            'AppBundle\Worker\Jobs\VideoFrameSplitter' => 'annostation.labeling_api.worker.job_instruction.video',
            'AppBundle\Worker\Jobs\KittiExporter' => 'annostation.labeling_api.worker.job_instruction.kitti_exporter',
        );
    }
}
