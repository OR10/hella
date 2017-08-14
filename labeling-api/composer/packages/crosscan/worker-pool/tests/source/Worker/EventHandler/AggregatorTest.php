<?php

namespace crosscan\WorkerPool\Tests\EventHandler;

use crosscan\WorkerPool\EventHandler;
use crosscan\WorkerPool\Job;

class AggregatorTest extends \PHPUnit_Framework_TestCase
{
    public function testAggregatorPassesEventsToAllEventHandlers()
    {
        $eventHandler      = new AggregatorTest_EventHandler();
        $otherEventHandler = new AggregatorTest_EventHandler();
        $aggregator        = new EventHandler\Aggregator(array($eventHandler, $otherEventHandler));

        $aggregator->workerStarted();
        $aggregator->workerStopping();
        $aggregator->beforeJob();
        $aggregator->jobScheduled(\Phake::mock('crosscan\WorkerPool\Job'));
        $aggregator->jobStart(\Phake::mock('crosscan\WorkerPool\Job'));
        $aggregator->jobFailed(\Phake::mock('crosscan\WorkerPool\Job'), \Phake::mock('Exception'));
        $aggregator->jobFinished(\Phake::mock('crosscan\WorkerPool\Job'));
        $aggregator->jobRescheduled(\Phake::mock('crosscan\WorkerPool\Job'));
        $aggregator->jobRedeliveredAfterReschedule(\Phake::mock('crosscan\WorkerPool\Job'));

        $expectedLog = array(
            'workerStarted',
            'workerStopping',
            'beforeJob',
            'jobScheduled',
            'jobStart',
            'jobFailed',
            'jobFinished',
            'jobRescheduled',
            'jobRedeliveredAfterReschedule',
        );

        $this->assertEquals($expectedLog, $eventHandler->log);
        $this->assertEquals($expectedLog, $otherEventHandler->log);
    }
}

class AggregatorTest_EventHandler extends EventHandler
{
    public $log = array();

    function workerStarted()
    {
        $this->log[] = __FUNCTION__;
    }

    function workerStopping()
    {
        $this->log[] = __FUNCTION__;
    }

    function beforeJob()
    {
        $this->log[] = __FUNCTION__;
    }

    function jobScheduled(Job $job)
    {
        $this->log[] = __FUNCTION__;
    }

    function jobStart(Job $job)
    {
        $this->log[] = __FUNCTION__;
    }

    function jobFailed(Job $job, \Exception $e)
    {
        $this->log[] = __FUNCTION__;
    }

    function jobFinished(Job $job)
    {
        $this->log[] = __FUNCTION__;
    }

    function jobRescheduled(Job $job)
    {
        $this->log[] = __FUNCTION__;
    }

    function jobRedeliveredAfterReschedule(Job $job)
    {
        $this->log[] = __FUNCTION__;
    }
}
