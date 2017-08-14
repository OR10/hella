<?php

namespace crosscan\WorkerPool\Job;

use crosscan\WorkerPool;

class Impossibruuuu extends WorkerPool\Job
{
    private $isRecoverable;

    public function __construct($isRecoverable)
    {
        $this->isRecoverable = $isRecoverable;
    }

    public function isRecoverable()
    {
        return $this->isRecoverable;
    }
}