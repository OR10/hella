<?php

namespace crosscan\WorkerPool;

use crosscan\Message;

abstract class Facade
{
    const NORMAL_PRIO = 'normal';
    const HIGH_PRIO   = 'high';
    const LOW_PRIO    = 'low';

    /**
     * Adds a Job to the WorkerPool.
     *
     * @param $job the job to be done
     * @param $priority the priority of the job
     */
    public abstract function addJob(Job $job, $priority = self::NORMAL_PRIO);
}