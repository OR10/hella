<?php

namespace crosscan\WorkerPool;

abstract class JobSource
{
    /**
     * Blocks until the next Job arrives or the timeout is reached. If possible it returns the next Job, null otherwise
     * The implementation of getNext is responsible for dispatching signals via pcntl_signal_dispatch.
     *
     * @param int $timeout Timeout in seconds i.e. how long to wait for the next job at max.
     *                     Defaults to 0 meaning no timeout
     *
     * @return JobDelivery|null
     */
    public abstract function getNext($timeout = 0);
}

