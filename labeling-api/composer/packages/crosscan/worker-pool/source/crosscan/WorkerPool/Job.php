<?php

namespace crosscan\WorkerPool;

use crosscan\Std;

/**
 * Completly arbitrary parent class for all Jobs
 * @package crosscan\WorkerPool
 */
abstract class Job
{
    /**
     * The default ttl for jobs. Currently set to 3 days.
     */
    const DEFAULT_TTL = 259200;

    public $priority;

    /**
     * @var \DateTime
     */
    public $createdAt;

    /**
     * Identifies this exact job run
     *
     * Will be preserved upon reschedules
     *
     * @var Std\UUID
     */
    private $uuid;

    /**
     * @var \DateTime
     */
    public $originallyCreated;

    /**
     * If set to true the Job will be deleted if the TTL times out
     * @var bool
     */
    public $discardOnTimeout = false;

    /**
     * Number of seconds until the Job should be forwarded to the garbage collection
     * Defaults to 259200 (= 3 days)
     *
     * A TTL of 0 leads to jobs executed excactly one time.
     * A TTL of less then 0 leads to jobs timing out never.
     *
     * @var int
     */
    public $ttl = self::DEFAULT_TTL;

    /**
     * Tracks how often the message was already rescheduled
     * @var int
     */
    public $numberOfReschedules = 0;

    /**
     * @return Std\UUID
     */
    public function getUuid()
    {
        return $this->uuid;
    }

    public function setUuid(Std\UUID $uuid)
    {
        $this->uuid = $uuid;
    }

    public function hasUuid()
    {
        return $this->getUuid() instanceof Std\UUID;
    }

    public function __construct()
    {
    }

    public function getJobName()
    {
        return get_class($this);
    }
}
