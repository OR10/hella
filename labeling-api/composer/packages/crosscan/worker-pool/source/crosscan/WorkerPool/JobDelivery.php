<?php

namespace crosscan\WorkerPool;

abstract class JobDelivery
{
    /**
     * @return Job
     */
    public abstract function getJob();

    /**
     * ack signalizes the backend that the job represented by this delivery was processed successfully.
     *
     * @return void
     */
    public abstract function ack();

    /**
     * nack signalized the backend that the job represented by thie delivery was not proccessed successuflly and should
     * be scheduled for a later delivery again.
     *
     * @return void
     */
    public abstract function nack();
}