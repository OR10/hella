<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool;

class ExceptionEstimator
{
    /**
     * @param \Exception $exception
     * @return returns true if the $exception is considered recoverable
     */
    public function considerRecoverable(\Exception $exception, WorkerPool\Job $job)
    {
        if ($exception instanceof Exception\Recoverable) {
            return true;
        }

        if ($exception instanceof \ezcPersistentQueryException || $exception instanceof \PDOException) {
            return (bool) preg_match(
                '((.*2006 MySQL server has gone away.*)|(.*2013 Lost connection to MySQL server during query.*))',
                $exception->getMessage()
            );
        }

        return false;
    }
}
