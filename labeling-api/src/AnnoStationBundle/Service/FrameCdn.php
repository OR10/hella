<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;

abstract class FrameCdn
{
    /**
     * @var bool
     */
    protected $transactionInProgress;

    /**
     * @var Model\Video|null
     */
    protected $transactionVideo;

    public function __construct()
    {
        $this->transactionInProgress = false;
        $this->transactionVideo      = null;
    }

    /**
     * Start a batch transaction before storing a lot of frames.
     *
     * Batch transactions are not guaranteed to be atomic. Furthermore they are not guaranteed to only execute actions
     * upon comitting.
     *
     * Storing files inside a transaction allows the service to possibly batch some of the storage operations for
     * better performance. Storing more than one frame should always be enclosed in a transaction.
     *
     * Transactions inside of transactions are not possible.
     *
     * @param Model\Video $video
     *
     * @return void
     *
     * @throws \RuntimeException
     */
    public function beginBatchTransaction(Model\Video $video)
    {
        if ($this->transactionInProgress === true) {
            throw new \RuntimeException('A frame cdn storage transaction is already in progress');
        }

        $this->transactionInProgress = true;
        $this->transactionVideo      = $video;
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

    /**
     * @param Model\Video $video
     * @param ImageType\Base $imageType
     * @param int $frameIndex
     * @param string $imageData
     *
     * @return mixed
     */
    abstract public function save(
        Model\Video $video,
        Model\Video\ImageType\Base $imageType,
        int $frameIndex,
        string $imageData
    );

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameIndex
     *
     * @return mixed
     */
    abstract public function delete(
        Model\Video $video,
        Model\Video\ImageType\Base $imageType,
        int $frameIndex
    );

    /**
     * @param Model\Video    $video
     *
     * @return mixed
     */
    abstract public function deleteVideoDirectory(
        Model\Video $video
    );

    /**
     * @param Model\LabelingTask $labeledFrame
     * @param ImageType\Base     $imageType
     * @param array              $frameNumbers
     *
     * @return array
     */
    abstract public function getFrameLocations(
        Model\LabelingTask $labeledFrame,
        ImageType\Base $imageType,
        array $frameNumbers
    );
}
