<?php


namespace crosscan\WorkerPool\Job;

use crosscan\Std;
use crosscan\WorkerPool;

/**
 * This job decorates other jobs and verifies a precondition before the decorated job is executed.
 *
 * It can be extended with information about the precondition.
 *
 * @property-read \crosscan\WorkerPool\Job $job
 */
abstract class PreConditionVerifier extends WorkerPool\Job
{
    /**
     * @var \crosscan\WorkerPool\Job
     */
    private $job;

    public function __construct(WorkerPool\Job $job)
    {
        $this->job = $job;
    }

    public function __get($name)
    {
        return $this->$name;
    }

    public function getUuid()
    {
        return $this->job->getUuid();
    }

    public function setUuid(Std\UUID $uuid)
    {
        $this->job->setUuid($uuid);
    }

    public function hasUuid()
    {
        return $this->job->hasUuid();
    }

    public function getJobName()
    {
        return get_class($this) . '-' . parent::getJobName();
    }

}
