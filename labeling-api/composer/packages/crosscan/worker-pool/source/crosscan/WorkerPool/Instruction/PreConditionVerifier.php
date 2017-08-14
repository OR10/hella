<?php


namespace crosscan\WorkerPool\Instruction;

use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;

abstract class PreConditionVerifier extends WorkerPool\JobInstruction
{

    /**
     * @var \crosscan\WorkerPool\JobInstructionFactory
     */
    private $jobInstructionFactory;

    public function __construct(WorkerPool\JobInstructionFactory $jobInstructionFactory)
    {
        $this->jobInstructionFactory = $jobInstructionFactory;
    }

    /**
     * @param Job\PreConditionVerifier $job
     * @param \crosscan\Logger\Facade\LoggerFacade $logger
     */
    public function run(WorkerPool\Job $job, \crosscan\Logger\Facade\LoggerFacade $logger)
    {
        if (!$this->isPreconditionFulfilled($job)) {
            if ($this->discardJobIfPreConditionNotFulfilled()) {
                $logger->logString(
                    sprintf(
                        'Discarded a job of type %s because the precondition of a job with the type %s was not fulfilled.',
                        get_class($job->job),
                        get_class($job)
                    ),
                    \cscntLogPayload::SEVERITY_DEBUG
                );
                return; // Discard by simply returning
            } else {
                throw new WorkerPool\Exception\Recoverable('Precondition not fulfilled!');
            }
        }
        $jobInstruction = $this->jobInstructionFactory->getInstructionForJob($job->job);
        $jobInstruction->run($job->job, $logger);
    }

    /**
     * @param WorkerPool\JobInstructionFactory $jobInstructionFactory
     *
     * @return PreConditionVerifier
     */
    public static function createInstanceWithJobInstructionFactory(
        WorkerPool\JobInstructionFactory $jobInstructionFactory
    ) {
        return new static($jobInstructionFactory);
    }

    /**
     * Determine whether the preconditions are fulfilled or not.
     *
     * @return bool
     */
    abstract function isPreconditionFulfilled(Job $job);

    /**
     * Determines if a job should be discarded when the precondition is not met.
     *
     * Defaults to false, should be overwritten by a child class.
     * An example use case would be the report generation of closed stores.
     *
     * @return bool
     */
    private function discardJobIfPreConditionNotFulfilled()
    {
        return false;
    }
}
