<?php

namespace AppBundle\Service;

use crosscan\WorkerPool\AMQP;
use AppBundle\Worker\Jobs;

class AmqpPoolConfig extends AMQP\AMQPPoolConfig
{
    /**
     * AMQPPoolConfig constructor.
     *
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

        $this->host                  = $host;
        $this->port                  = $port;
        $this->vhost                 = $vhost;
        $this->username              = $username;
        $this->password              = $password;
        $this->useDeadLetterExchange = $useDeadLetterExchange;
        $this->useAlternateExchange  = $useAlternateExchange;
        $this->heartBeatSeconds      = 0;

        $this->instructionInstances = array(
            Jobs\VideoFrameSplitter::class => 'annostation.labeling_api.worker.job_instruction.video',
            Jobs\KittiExporter::class      => 'annostation.labeling_api.worker.job_instruction.kitti_exporter',
            Jobs\Interpolation::class      => 'annostation.labeling_api.worker.job_instruction.interpolation',
            Jobs\CsvExporter::class        => 'annostation.labeling_api.worker.job_instruction.csv_exporter',
            Jobs\ProjectCsvExporter::class => 'annostation.labeling_api.worker.job_instruction.project_csv_exporter',
            Jobs\Report::class             => 'annostation.labeling_api.worker.job_instruction.report',
            Jobs\Exporter::class           => 'annostation.labeling_api.worker.job_instruction.exporter',
        );
    }
}
