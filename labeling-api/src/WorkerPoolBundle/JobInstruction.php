<?php

namespace Hagl\WorkerPoolBundle;

use crosscan\Logger;
use crosscan\WorkerPool;

/**
 * Simple extension of a normal JobInstruction which can be queried if a given Job is supported by the JobInstruction.
 * This extension allows an easier way of dispatching Jobs to a registered JobInstruction by the JobInstructionFactory.
 */
abstract class JobInstruction extends WorkerPool\JobInstruction
{
    /**
     * Simple implementation which catches Throwables and converts them into a JobFailedException which can be handled
     * by the WorkerPool.
     *
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     *
     * @throws WorkerPool\Exception\Recoverable
     * @throws JobFailedException
     */
    final public function run(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        try {
            $this->runJob($job, $loggerFacade);
        } catch (WorkerPool\Exception\Recoverable $e) {
            throw $e;
        } catch (\Throwable $throwable) {
            $loggerFacade->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);

            throw new JobFailedException($throwable);
        }
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    abstract protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade);

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    abstract public function supports(WorkerPool\Job $job);
}
