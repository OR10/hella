<?php

namespace crosscan\WorkerPool\AMQP;

class ExceptionQueueFinderTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider provideStuff
     */
    public function testRedeliverQueue($job, $exception, $exceptionEstimator, $expectedQueue)
    {
        $exceptionQueueFinder = new ExceptionQueueFinder($exceptionEstimator);

        $this->assertSame($expectedQueue, $exceptionQueueFinder->findQueue($job, $exception));
    }

    public function provideStuff()
    {
        $garbageExceptionEstimator = \Phake::mock('crosscan\WorkerPool\AMQP\ExceptionEstimator');
        $normalExceptionEstimator  = \Phake::mock('crosscan\WorkerPool\AMQP\ExceptionEstimator');

        \Phake::when($garbageExceptionEstimator)->considerRecoverable(\Phake::anyParameters())->thenReturn(false);
        \Phake::when($normalExceptionEstimator)->considerRecoverable(\Phake::anyParameters())->thenReturn(true);

        $fakeException = \Phake::mock('Exception');

        $garbageJob               = \Phake::mock('crosscan\WorkerPool\Job');
        $neverRescheduledJob      = \Phake::mock('crosscan\WorkerPool\Job');
        $negativeRescheduledJob   = \Phake::mock('crosscan\WorkerPool\Job');
        $oneTimeRescheduledJob    = \Phake::mock('crosscan\WorkerPool\Job');
        $twoTimesRescheduledJob   = \Phake::mock('crosscan\WorkerPool\Job');
        $threeTimesRescheduledJob = \Phake::mock('crosscan\WorkerPool\Job');
        $fourTimesRescheduledJob  = \Phake::mock('crosscan\WorkerPool\Job');

        $neverRescheduledJob->numberOfReschedules      = 0;
        $negativeRescheduledJob->numberOfReschedules   = -1;
        $oneTimeRescheduledJob->numberOfReschedules    = 1;
        $twoTimesRescheduledJob->numberOfReschedules   = 2;
        $threeTimesRescheduledJob->numberOfReschedules = 3;
        $fourTimesRescheduledJob->numberOfReschedules  = 4;

        return array(
            array(
                'job'                => $garbageJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $garbageExceptionEstimator,
                'expectedQueue'      => 'worker.garbage-collection'
            ),
            array(
                'job'                => $negativeRescheduledJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $normalExceptionEstimator,
                'expectedQueue'      => 'worker.reschedule.30s'
            ),
            array(
                'job'                => $neverRescheduledJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $normalExceptionEstimator,
                'expectedQueue'      => 'worker.reschedule.30s'
            ),
            array(
                'job'                => $oneTimeRescheduledJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $normalExceptionEstimator,
                'expectedQueue'      => 'worker.reschedule.60s'
            ),
            array(
                'job'                => $twoTimesRescheduledJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $normalExceptionEstimator,
                'expectedQueue'      => 'worker.reschedule.300s'
            ),
            array(
                'job'                => $threeTimesRescheduledJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $normalExceptionEstimator,
                'expectedQueue'      => 'worker.reschedule.900s'
            ),
            array(
                'job'                => $fourTimesRescheduledJob,
                '$exception'         => $fakeException,
                'exceptionEstimator' => $normalExceptionEstimator,
                'expectedQueue'      => 'worker.reschedule.900s'
            ),
        );
    }
}