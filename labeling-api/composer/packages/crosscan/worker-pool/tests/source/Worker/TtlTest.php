<?php

use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool\Job;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;

class TtlTest extends \PHPUnit_Framework_TestCase
{
    function testTimeout()
    {
        $job            = new Job\TestJob();
        $job->ttl       = 1;
        $job->createdAt = new DateTime('Yesterday');
        $job->message   = "bluubba";

        $jobDelivery = \Phake::mock('crosscan\WorkerPool\JobDelivery');
        \Phake::when($jobDelivery)->getJob()->thenReturn($job);

        $jobSource = \Phake::mock('crosscan\WorkerPool\JobSource');
        \Phake::when($jobSource)->getNext()->thenReturn($jobDelivery);

        $newRelicWrapperMock = \Phake::mock('crosscan\NewRelic\Wrapper');
        $loggerMock          = \Phake::mock('crosscan\Logger\Facade\LoggerFacade');

        $rescheduleMock = \Phake::mock('crosscan\WorkerPool\RescheduleManager');

        $worker = new WorkerPool\Worker(
            $jobSource,
            new WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array('crosscan\WorkerPool\Job\TestJob' => '\crosscan\WorkerPool\Instruction\TestJobOutputter')),
            $loggerMock,
            $rescheduleMock,
            $newRelicWrapperMock
        );

        $worker->work(1);

        $expectedException = new Exception\TimeOutException();
        \Phake::verify($rescheduleMock)->handle($job, $jobDelivery, \Phake::capture($actualException));

        $this->assertEquals($expectedException, $actualException);
    }

    public function  testTimeoutWithDiscardSetToTrue()
    {
        $job                   = new Job\TestJob();
        $job->discardOnTimeout = true;
        $job->ttl              = 1;
        $job->createdAt        = new DateTime('Yesterday');
        $job->message          = "bluubba";

        $jobDeliveryMock = \Phake::mock('crosscan\WorkerPool\JobDelivery');
        \Phake::when($jobDeliveryMock)->getJob()->thenReturn($job);

        $loggerMock     = \Phake::mock('crosscan\Logger\Facade\LoggerFacade');
        $configMock     = \Phake::mock('crosscan\WorkerPool\AMQP\AMQPPoolConfig');
        $connectionMock = \Phake::mock('\PhpAmqpLib\Connection\AMQPStreamConnection');
        $channelMock    = \Phake::mock('\PhpAmqpLib\Channel\AbstractChannel');

        \Phake::when($configMock)->openConnection()->thenReturn($connectionMock);
        \Phake::when($connectionMock)->channel()->thenReturn($channelMock);

        $exceptionEstimator = new AMQP\ExceptionEstimator();
        $queueFinder        = new AMQP\ExceptionQueueFinder($exceptionEstimator);
        $amqpRescheduler    = new WorkerPool\AMQP\AMQPRescheduleManager($configMock, $queueFinder, $loggerMock);
        $newRelicMock       = \Phake::mock('crosscan\NewRelic\Wrapper');
        $jobSourceMock      = \Phake::mock('crosscan\WorkerPool\JobSource');
        \Phake::when($jobSourceMock)->getNext()->thenReturn($jobDeliveryMock);

        $worker = new WorkerPool\Worker(
            $jobSourceMock,
            new WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array('crosscan\WorkerPool\Job\TestJob' => '\crosscan\WorkerPool\Instruction\TestJobOutputter')),
            $loggerMock,
            $amqpRescheduler,
            $newRelicMock
        );

        \Phake::verifyNoFurtherInteraction($channelMock);

        $worker->work(1);
    }
}
