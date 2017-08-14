<?php


namespace crosscan\WorkerPool\JobInstructionFactory;

use \crosscan\WorkerPool;

/**
 * JobInstructionFactory that leverages a collection of Factories for creating instructions
 *
 * The order of the factories determines their priority upon constructing new Instructions.
 */
class Aggregated extends WorkerPool\JobInstructionFactory
{
    /**
     * @var WorkerPool\JobInstructionFactory[]
     */
    private $JobInstructionFactories;

    /**
     * @param WorkerPool\JobInstructionFactory[] $JobInstructionFactories
     */
    public function __construct(array $JobInstructionFactories)
    {
        $this->JobInstructionFactories = $JobInstructionFactories;
    }

    function getInstructionForJob(WorkerPool\Job $job)
    {
        foreach ($this->JobInstructionFactories as $factory) {
            if($factory->supports($job)) {
                return $factory->getInstructionForJob($job);
            }
        }

        throw new WorkerPool\Exception("Could not find a Job Instruction for " . get_class($job));
    }

    /**
     * States whether this Factory supports the given Job.
     *
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    function supports(WorkerPool\Job $job)
    {
        foreach ($this->JobInstructionFactories as $factory) {
            if($factory->supports($job)) {
                return true;
            }
        }

        return false;
    }
}
