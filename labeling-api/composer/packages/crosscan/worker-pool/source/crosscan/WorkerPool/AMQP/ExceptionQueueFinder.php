<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;

class ExceptionQueueFinder
{
    /**
     * @var ExceptionEstimator
     */
    private $exceptionEstimator;

    private $garbageQueueName = 'worker.garbage-collection';

    private $buckets = array(
        'worker.reschedule.30s',
        'worker.reschedule.60s',
        'worker.reschedule.300s',
        'worker.reschedule.900s',
    );

    /**
     * @param ExceptionEstimator $exceptionEstimator
     */
    public function __construct(ExceptionEstimator $exceptionEstimator)
    {
        $this->exceptionEstimator = $exceptionEstimator;
    }

    /**
     * @param WorkerPool\Job $job
     * @param \Exception     $exception
     */
    public function findQueue(WorkerPool\Job $job, \Exception $exception)
    {
        if ($this->exceptionEstimator->considerRecoverable($exception, $job)) {
            if ($exception instanceof Exception\RecoverableAsLateAsPossible) {
                // return the last bucket and thus reschedule as late as possible
                return $this->buckets[count($this->buckets) - 1];
            } else {
                return $this->getRescheduleBucket($job->numberOfReschedules);
            }
        } else {
            return $this->garbageQueueName;
        }
    }

    /**
     * @return string
     */
    public function getGarbageQueueName()
    {
        return $this->garbageQueueName;
    }

    /**
     * @param int $numberOfReschedules
     *
     * @return string
     */
    private function getRescheduleBucket($numberOfReschedules)
    {
        $index = $numberOfReschedules;

        if ($numberOfReschedules < 0) {
            $index = 0;
        } elseif ($numberOfReschedules >= count($this->buckets)) {
            $index = count($this->buckets) - 1;
        }

        return $this->buckets[$index];
    }
}
