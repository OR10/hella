<?php

namespace crosscan\WorkerPool\Instruction;

use crosscan\WorkerPool;

class TestJobOutputter extends WorkerPool\JobInstruction
{
    public function run(WorkerPool\Job $job, \crosscan\Logger\Facade\LoggerFacade $logger)
    {
        switch (true) {
            case $job instanceof WorkerPool\Job\TestJob:
                $logger->logString(
                    "Testout for a TestJob: " . $job->message,
                    \cscntLogPayload::SEVERITY_FATAL
                );
                file_put_contents($job->filename, $job->message);
                return true;
                break;
            case $job instanceof WorkerPool\Job\Impossibruuuu:
                if ($job->isRecoverable()) {
                    throw new WorkerPool\Exception\Recoverable('Impossibruuuu');
                } else {
                    throw new \Exception('unrecoverable error');
                }
                break;
            default:
                throw new \Exception('Unknown Job class: ' . get_class($job));
        }
    }
}