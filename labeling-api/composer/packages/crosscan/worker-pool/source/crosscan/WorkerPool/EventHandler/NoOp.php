<?php

namespace crosscan\WorkerPool\EventHandler;

use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;

class NoOp extends WorkerPool\EventHandler
{
    function workerStarted()
    {
    }

    function workerStopping()
    {
    }

    function beforeJob()
    {
    }

    function jobScheduled(Job $job)
    {
    }

    function jobStart(Job $job)
    {
    }

    function jobFailed(Job $job, \Exception $e)
    {
    }

    function jobFinished(Job $job)
    {
    }

    function jobRescheduled(Job $job)
    {
    }

    function jobRedeliveredAfterReschedule(Job $job)
    {
    }
}
