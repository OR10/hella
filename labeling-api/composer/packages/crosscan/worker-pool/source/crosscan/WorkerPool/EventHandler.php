<?php


namespace crosscan\WorkerPool;

/**
 * WorkerPool Event Handling mechanism
 *
 * It does not allow Controlling the WorkerPool yet,
 * but allows you to get information about what the WorkerPool is doing.
 */
abstract class EventHandler
{
    /**
     * A worker was started
     */
    abstract function workerStarted();

    /**
     * A worker is about to  stop
     */
    abstract function workerStopping();

    /**
     * A new job is gonna be handled.
     *
     * This could be used for cleanup, for instance an identity map could be resetted.
     */
    abstract function beforeJob();

    /**
     * A new job has been added to the WorkerPool and should be handled soon
     */
    abstract function jobScheduled(Job $job);

    /**
     * The given job is in the works now
     */
    abstract function jobStart(Job $job);

    /**
     * The given job failed
     */
    abstract function jobFailed(Job $job, \Exception $e);

    /**
     * The given job was finished successfully
     */
    abstract function jobFinished(Job $job);

    /**
     * This job was rescheduled and will be finished at some other point in time
     */
    abstract function jobRescheduled(Job $job);

    /**
     * The previously rescheduled job was redelivered for fulfilment
     */
    abstract function jobRedeliveredAfterReschedule(Job $job);
}
