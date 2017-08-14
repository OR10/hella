<?php


namespace crosscan\WorkerPool\EventHandler;

use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;

/**
 * Allows multiple EventHandlers to be aggregated
 */
class Aggregator extends WorkerPool\EventHandler
{
    /**
     * @var WorkerPool\EventHandler[]
     */
    private $eventHandlers;

    /**
     * @param WorkerPool\EventHandler[] $eventHandlers
     */
    public function __construct(array $eventHandlers)
    {
        $this->eventHandlers = $eventHandlers;
    }

    /**
     * A worker was started
     */
    function workerStarted()
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * A worker is about to  stop
     */
    function workerStopping()
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * A new job is gonna be handled.
     *
     * This could be used for cleanup, for instance an identity map could be resetted.
     */
    function beforeJob()
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * A new job has been added to the WorkerPool and should be handled soon
     */
    function jobScheduled(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * The given job is in the works now
     */
    function jobStart(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * The given job failed
     */
    function jobFailed(Job $job, \Exception $e)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * The given job was finished successfully
     */
    function jobFinished(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * This job was rescheduled and will be finished at some other point in time
     */
    function jobRescheduled(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * The previously rescheduled job was redelivered for fulfilment
     */
    function jobRedeliveredAfterReschedule(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    private function dispatchToEventHandlers($method, $arguments)
    {
        foreach ($this->eventHandlers as $eventHandler) {
            call_user_func_array(array($eventHandler, $method), $arguments);
        }
    }
}
