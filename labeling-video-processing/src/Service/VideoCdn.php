<?php

namespace Service;

class VideoCdn extends S3Cmd
{
    /**
     * @var bool
     */
    protected $transactionInProgress;

    /**
     * @var string|null
     */
    protected $transactionVideo;

    /**
     * @param string $videoId
     *
     * @return void
     *
     * @throws \RuntimeException
     */
    public function beginBatchTransaction(string $videoId)
    {
        if ($this->transactionInProgress === true) {
            throw new \RuntimeException('A video cdn storage transaction is already in progress');
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
            throw new \RuntimeException('No video cdn storage transaction in progress.');
        }

        $this->transactionInProgress = false;
        $this->transactionVideo      = null;
    }

}
