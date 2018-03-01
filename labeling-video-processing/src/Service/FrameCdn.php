<?php

namespace Service;

class FrameCdn extends S3Cmd
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
            throw new \RuntimeException('A frame cdn storage transaction is already in progress');
        }

        $this->transactionInProgress = true;
        $this->transactionVideo      = $videoId;

        parent::beginBatchTransaction($videoId);
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

        parent::commit();
    }

}
