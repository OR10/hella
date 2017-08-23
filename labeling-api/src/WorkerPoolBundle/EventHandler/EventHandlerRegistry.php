<?php

namespace Hagl\WorkerPoolBundle\EventHandler;

use crosscan\WorkerPool\EventHandler;
use crosscan\WorkerPool\Job;

/**
 * Simple EventHandler registry which allows registering EventHandlers *after* instantiation which is useful for using
 * a symfony compiler pass, for example, to define EventHandlers in a convenient, loosely coupled way.
 */
class EventHandlerRegistry extends EventHandler
{
    /**
     * @var EventHandler[]
     */
    private $eventHandlers = [];

    /**
     * Register a new EventHandler
     *
     * @param EventHandler $eventHandler
     *
     * @return $this
     */
    public function registerEventHandler(EventHandler $eventHandler)
    {
        $this->eventHandlers[] = $eventHandler;

        return $this;
    }

    public function workerStarted()
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function workerStopping()
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function beforeJob()
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function jobScheduled(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function jobStart(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function jobFailed(Job $job, \Exception $e)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function jobFinished(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function jobRescheduled(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    public function jobRedeliveredAfterReschedule(Job $job)
    {
        $this->dispatchToEventHandlers(__FUNCTION__, func_get_args());
    }

    /**
     * @param string $method
     * @param array  $arguments
     */
    private function dispatchToEventHandlers(string $method, array $arguments)
    {
        foreach ($this->eventHandlers as $eventHandler) {
            call_user_func_array(array($eventHandler, $method), $arguments);
        }
    }
}
