<?php

namespace AppBundle\Service\FrameCdn;

use AppBundle\Service;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use League\Flysystem\Adapter;
use League\Flysystem\Filesystem;

class S3Cli extends Service\FrameCdn
{
    /**
     * @var string
     */
    protected $frameCdnBaseUrl;

    /**
     * @var Service\S3Uploader
     */
    private $uploader;

    /**
     * @var Filesystem
     */
    private $cacheFileSystem;

    /**
     * @var string|null
     */
    private $currentBatchDirectory;

    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * FrameCdn constructor.
     *
     * @param string                $frameCdnBaseUrl
     * @param string                $cacheDirectory
     * @param Service\S3CliUploader $uploader
     */
    public function __construct($frameCdnBaseUrl, $cacheDirectory, Service\S3CliUploader $uploader)
    {
        parent::__construct();

        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
        $this->uploader        = $uploader;
        $this->cacheDirectory  = $cacheDirectory;

        $this->cacheFileSystem = new Filesystem(new Adapter\Local($cacheDirectory));

        $this->currentBatchDirectory = null;
    }

    public function beginBatchTransaction(Model\Video $video)
    {
        parent::beginBatchTransaction($video);
        $this->currentBatchDirectory = $this->getTemporaryDirectory();
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameIndex
     * @param string         $imageData
     *
     * @return void
     * @throws \Exception
     */
    public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, $frameIndex, $imageData)
    {
        $cdnPath  = sprintf(
            '%s/%s/%s',
            $this->currentBatchDirectory,
            $video->getId(),
            $imageType->getName()
        );
        $filePath = sprintf(
            '%s/%s/%s.%s',
            $this->currentBatchDirectory,
            $cdnPath,
            $frameIndex,
            $imageType->getExtension()
        );

        if (!$this->cacheFileSystem->has($cdnPath)) {
            $this->cacheFileSystem->createDir($cdnPath);
        }
        $this->cacheFileSystem->put($filePath, $imageData);
    }

    public function commit()
    {
        $batchDirectoryFullPath = sprintf('%s/%s', $this->cacheDirectory, $this->currentBatchDirectory);

        $this->uploader->uploadDirectory($batchDirectoryFullPath, '/');
        $this->cacheFileSystem->deleteDir($this->currentBatchDirectory);

        $this->currentBatchDirectory = null;

        parent::commit();
    }

    /**
     * @param Model\LabelingTask          $labelingTask
     * @param ImageType\Base              $imageType
     * @param Model\FrameIndexRange|array $frameNumbers
     *
     * @return array
     */
    public function getFrameLocations(
        Model\LabelingTask $labelingTask,
        ImageType\Base $imageType,
        array $frameNumbers
    ) {
        $urls = [];
        foreach ($frameNumbers as $index => $frameNumber) {
            $urls[] = [
                "frameIndex" => $index,
                'url'        => sprintf(
                    '%s/%s/%s/%s.%s',
                    $this->frameCdnBaseUrl,
                    $labelingTask->getVideoId(),
                    $imageType->getName(),
                    $frameNumber,
                    $imageType->getExtension()
                ),
            ];
        }

        return $urls;
    }

    /**
     * @return string
     */
    private function getTemporaryDirectory()
    {
        do {
            $tempDir = sprintf('%s_%s_%s', 's3_batch_upload', $this->transactionVideo->getId(), uniqid());
        } while ($this->cacheFileSystem->has($tempDir));

        $this->cacheFileSystem->createDir($tempDir);

        return $tempDir;
    }

}
