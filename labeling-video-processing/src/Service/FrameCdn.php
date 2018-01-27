<?php

namespace Service;

abstract class FrameCdn
{
    /**
     * @var bool
     */
    protected $transactionInProgress;

    /**
     * @var int|null
     */
    protected $transactionVideo;

    public function __construct()
    {
        $this->transactionInProgress = false;
        $this->transactionVideo      = null;
    }

    /**
     * @param int $videoId
     *
     * @return void
     *
     * @throws \RuntimeException
     */
    public function beginBatchTransaction(int $videoId)
    {
        if ($this->transactionInProgress === true) {
            throw new \RuntimeException('A frame cdn storage transaction is already in progress');
        }

        $this->transactionInProgress = true;
        $this->transactionVideo      = $videoId;
    }

    /**
     * End a started batch transaction possibly committing its operations
     *
     * @return void
     */
    public function commit()
    {
        if ($this->transactionInProgress === false) {
            throw new \RuntimeException('No frame cdn storage transaction in progress.');
        }

        $this->transactionInProgress = false;
        $this->transactionVideo      = null;
    }

}
