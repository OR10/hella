<?php

namespace AnnoStationBundle\Service\FrameCdn;

use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use League\Flysystem\Adapter;
use League\Flysystem\Filesystem;
use crosscan\Logger\Facade\LoggerFacade;

class S3Cmd extends Service\FrameCdn
{
    /**
     * @var string
     */
    protected $frameCdnBaseUrl;

    /**
     * @var Service\S3Cmd
     */
    private $s3CmdFrameCdn;

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
     * @var \cscntLogger
     */
    private $loggerFacade;

    /**
     * FrameCdn constructor.
     *
     * @param string        $frameCdnBaseUrl
     * @param string        $cacheDirectory
     * @param Service\S3Cmd $s3CmdFrameCdn
     * @param \cscntLogger  $logger
     */
    public function __construct(
        $frameCdnBaseUrl,
        $cacheDirectory,
        Service\S3Cmd $s3CmdFrameCdn,
        \cscntLogger $logger
    ) {
        parent::__construct();

        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
        $this->s3CmdFrameCdn   = $s3CmdFrameCdn;
        $this->cacheDirectory  = $cacheDirectory;
        $this->loggerFacade    = new LoggerFacade($logger, self::class);

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
     * @return string
     */
    public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, int $frameIndex, string $imageData)
    {
        $cdnPath  = sprintf(
            '%s/%s/%s',
            $this->currentBatchDirectory,
            $video->getId(),
            $imageType->getName()
        );
        $filePath = sprintf(
            '%s/%s.%s',
            $cdnPath,
            $frameIndex,
            $imageType->getExtension()
        );

        if (!$this->cacheFileSystem->has($cdnPath)) {
            $this->cacheFileSystem->createDir($cdnPath);
        }
        $this->cacheFileSystem->put($filePath, $imageData);

        return $filePath = sprintf(
            '%s/%s/%s.%s',
            $video->getId(),
            $imageType->getName(),
            $frameIndex,
            $imageType->getExtension()
        );
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameIndex
     *
     * @return mixed|void
     */
    public function delete(Model\Video $video, Model\Video\ImageType\Base $imageType, int $frameIndex)
    {
        $cdnPath  = sprintf(
            '%s/%s/%s.%s',
            $video->getId(),
            $imageType->getName(),
            $frameIndex,
            $imageType->getExtension()
        );

        $this->s3CmdFrameCdn->deleteObject($cdnPath);
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed|void
     */
    public function deleteVideoDirectory(Model\Video $video)
    {
        $frameRange = range(1, $video->getMetaData()->numberOfFrames);
        foreach ($video->getImageTypes() as $imageType => $data) {
            $imageType = Model\Video\ImageType\Base::create($imageType);
            foreach ($frameRange as $frameIndex) {
                try {
                    $this->delete($video, $imageType, $frameIndex);
                } catch (\Exception $exception) {
                    $this->loggerFacade->logString(
                        sprintf(
                            'Failed to delete FrameIndex %s of type %s for video %s from frame-cdn',
                            $frameIndex,
                            $imageType->getName(),
                            $video->getId()

                        ),
                        \cscntLogPayload::SEVERITY_WARNING
                    );
                }
            }
            $imageTypeDir = sprintf(
                '%s/%s/',
                $video->getId(),
                $imageType->getName()
            );
            try {
                $this->s3CmdFrameCdn->deleteObject($imageTypeDir);
            } catch (\Exception $exception) {
                $this->loggerFacade->logString(
                    sprintf(
                        'Failed to delete ImageType directory %s for video %s from frame-cdn',
                        $imageType->getName(),
                        $video->getId()

                    ),
                    \cscntLogPayload::SEVERITY_WARNING
                );
            }
        }
        $videoDir = sprintf(
            '%s/',
            $video->getId()
        );
        try {
            $this->s3CmdFrameCdn->deleteObject($videoDir);
        } catch (\Exception $exception) {
            $this->loggerFacade->logString(
                sprintf(
                    'Failed to delete video directory %s from frame-cdn' ,
                    $video->getId()

                ),
                \cscntLogPayload::SEVERITY_WARNING
            );
        }
    }

    public function commit()
    {
        $batchDirectoryFullPath = sprintf('%s/%s', $this->cacheDirectory, $this->currentBatchDirectory);

        try {
            $this->s3CmdFrameCdn->uploadDirectory($batchDirectoryFullPath, '/', 'public');
        } finally {
            if (!$this->cacheFileSystem->deleteDir($this->currentBatchDirectory)) {
                throw new \RuntimeException("Error removing temporary directory '{$this->currentBatchDirectory}'");
            }
        }

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
    public function getFrameLocations(Model\LabelingTask $labelingTask, ImageType\Base $imageType, array $frameNumbers)
    {
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
