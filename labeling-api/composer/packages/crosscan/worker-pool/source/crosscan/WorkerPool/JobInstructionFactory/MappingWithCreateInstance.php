<?php

namespace crosscan\WorkerPool\JobInstructionFactory;

use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;

/**
 * This is a quite simple JobInstructionFactory
 *
 * It therefor needs a mapping of job classes to job instruction classes.
 * It also handles creating the instances, by calling a static factory method called
 * createInstanceWithJobInstructionFactory (and injecting itself) if it exists, or calling a static factory method called
 * createInstance if it exists. Otherwise it assumes that the instruction has an empty constructor.
 */
class MappingWithCreateInstance extends WorkerPool\JobInstructionFactory
{
    /**
     * @var array
     */
    private $jobToInstructionMapping;

    /**
     * @param array $jobToInstructionMapping An array mapping the job classes (key) to instruction classes (value)
     */
    public function __construct(array $jobToInstructionMapping)
    {
        $this->jobToInstructionMapping = $jobToInstructionMapping;
    }

    /**
     * Create the JobInstruction for a job.
     *
     * @param WorkerPool\Job $job
     *
     * @return WorkerPool\JobInstruction
     */
    public function getInstructionForJob(WorkerPool\Job $job)
    {
        $jobInstructionClass = $this->getInstructionClassForJob($job);

        if (!class_exists($jobInstructionClass)) {
            throw new WorkerPool\Exception(sprintf('JobInstruction class %s not found', $jobInstructionClass));
        }

        if (is_callable(array($jobInstructionClass, 'createInstanceWithJobInstructionFactory'))) {
            return $jobInstructionClass::createInstanceWithJobInstructionFactory($this);
        }

        if (is_callable(array($jobInstructionClass, 'createInstance'))) {
            return $jobInstructionClass::createInstance();
        }

        return new $jobInstructionClass();
    }

    private function getInstructionClassForJob(WorkerPool\Job $job)
    {
        $class = get_class($job);

        if (isset($this->jobToInstructionMapping[$class])) {
            return $this->jobToInstructionMapping[$class];
        }

        throw new WorkerPool\Exception("Could not find a Job Instruction for " . $class);
    }

    /**
     * States whether this Factory supports the given Job.
     *
     * @param Job $job
     *
     * @return bool
     */
    function supports(Job $job)
    {
        return isset($this->jobToInstructionMapping[get_class($job)]);
    }
}
