<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\WorkerPool;

/**
 * @property-read WorkerPool\Job $job
 * @property-read string $routingKey
 * @property-read string $cscntRequestId
 */
class RescheduleMessage
{
    private $job;
    private $routingKey;
    private $cscntRequestId;

    /**
     * @param WorkerPool\Job $job
     * @param string $routingKey
     * @param string $cscntRequestId
     */
    public function __construct(WorkerPool\Job $job, $routingKey, $cscntRequestId)
    {
        $this->job            = $job;
        $this->routingKey     = $routingKey;
        $this->cscntRequestId = $cscntRequestId;
    }

    public function __get($name)
    {
        return $this->$name;
    }
}