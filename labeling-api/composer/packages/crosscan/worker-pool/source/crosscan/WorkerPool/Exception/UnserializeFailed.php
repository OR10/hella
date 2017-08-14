<?php

namespace crosscan\WorkerPool\Exception;

use crosscan\WorkerPool;
use Exception;

/**
 * Failed to unserialize a payload
 */
class UnserializeFailed extends WorkerPool\Exception
{
    /**
     * @var string
     */
    private $payload;

    /**
     * @return string
     */
    public function getPaylaod()
    {
        return $this->payload;
    }

    public function __construct($paylod)
    {
        $this->payload = $paylod;
        parent::__construct(sprintf('Failed to unserialize payload: %s', $paylod));
    }
}
