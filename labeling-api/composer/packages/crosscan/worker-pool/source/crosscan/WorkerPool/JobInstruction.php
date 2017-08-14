<?php

namespace crosscan\WorkerPool;

abstract class JobInstruction
{
    public abstract function run(Job $job, \crosscan\Logger\Facade\LoggerFacade $logger);
}