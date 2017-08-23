<?php
namespace Hagl\WorkerPoolBundle;

use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP\ExceptionEstimator as AmqpExceptionEstimator;

/**
 * Class ExceptionEstimator
 *
 * Extends the default ExceptionEstimator with the possibility to abort rescheduling jobs after reaching a certain
 * number of reschedules.
 *
 * @package Hagl\WorkerPoolBundle
 */
class ExceptionEstimator extends AmqpExceptionEstimator
{
    /**
     * @var int
     */
    private $maximumNumberOfReschedules;

    /**
     * ExceptionEstimator constructor.
     *
     * @param int $maximumNumberOfReschedules
     */
    public function __construct(int $maximumNumberOfReschedules)
    {
        $this->maximumNumberOfReschedules = $maximumNumberOfReschedules;
    }

    /**
     * @param \Exception     $exception
     * @param WorkerPool\Job $job
     *
     * @return bool|WorkerPool\AMQP\returns
     */
    public function considerRecoverable(\Exception $exception, WorkerPool\Job $job)
    {
        if ($job->numberOfReschedules < $this->maximumNumberOfReschedules) {
            return parent::considerRecoverable($exception, $job);
        }

        return false;
    }
}
