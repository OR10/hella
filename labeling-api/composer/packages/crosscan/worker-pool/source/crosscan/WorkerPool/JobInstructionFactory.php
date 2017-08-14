<?php

namespace crosscan\WorkerPool;

/**
 * JobInstructionFactories create JobInstructions for Jobs.
 */
abstract class JobInstructionFactory
{
    /**
     * Create the JobInstruction for a job.
     *
     * @param Job $job
     * @return JobInstruction
     */
    abstract function getInstructionForJob(Job $job);

    /**
     * States whether this Factory supports the given Job.
     *
     * @param Job $job
     *
     * @return bool
     */
    abstract function supports(Job $job);
}
