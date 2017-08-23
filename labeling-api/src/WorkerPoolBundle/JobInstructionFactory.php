<?php

namespace Hagl\WorkerPoolBundle;

use crosscan\WorkerPool;

class JobInstructionFactory extends WorkerPool\JobInstructionFactory
{
    /**
     * @var JobInstruction[]
     */
    private $jobInstructions = [];

    /**
     * @param JobInstruction $jobInstruction
     */
    public function addJobInstruction(JobInstruction $jobInstruction)
    {
        $this->jobInstructions[] = $jobInstruction;
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return WorkerPool\JobInstruction
     *
     * @throws \InvalidArgumentException
     */
    public function getInstructionForJob(WorkerPool\Job $job)
    {
        foreach ($this->jobInstructions as $jobInstruction) {
            if ($jobInstruction->supports($job)) {
                return $jobInstruction;
            }
        }

        throw new \InvalidArgumentException('Could not find a job instruction for job of type: ' . get_class($job));
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        foreach ($this->jobInstructions as $jobInstruction) {
            if ($jobInstruction->supports($job)) {
                return true;
            }
        }

        return false;
    }
}
