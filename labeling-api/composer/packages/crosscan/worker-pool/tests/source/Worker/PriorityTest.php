<?php

namespace crosscan\WorkerPool;

use crosscan\WorkerPool;

class PriorityTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @expectedException \InvalidArgumentException
     */
    public function testExceptionOnInvalidRoutingKey()
    {
        $loggerMock = \Phake::mock('cscntLogger');
        $config     = new WorkerPool\AMQP\AMQPPoolConfig();

        $pool = new AMQP\FacadeAMQP($config, $loggerMock);
        $job  = new WorkerPool\Job\TestJob();

        $pool->addJob($job, 'invalid');
    }
}
