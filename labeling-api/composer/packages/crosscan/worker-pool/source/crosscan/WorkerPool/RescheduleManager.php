<?php

namespace crosscan\WorkerPool;

use crosscan\WorkerPool\Exception;

abstract class RescheduleManager
{
    public abstract function handle(Job $job, JobDelivery $jobDelivery, \Exception $exception);
    public abstract function handleUnserializeFailed(Exception\UnserializeFailed $exception);
}
