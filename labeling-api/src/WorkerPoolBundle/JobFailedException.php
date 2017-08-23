<?php

namespace Hagl\WorkerPoolBundle;

/**
 * Class JobFailedException
 *
 * @package Hagl\WorkerPoolBundle
 */
class JobFailedException extends \Exception
{
    /**
     * JobFailedException constructor.
     *
     * @param \Throwable|null $previous
     */
    public function __construct(\Throwable $previous = null)
    {
        parent::__construct('Job failed: '. $previous->getMessage(), 0, $previous);
    }
}
