<?php

namespace Service;

use Model;
use League\Flysystem\Adapter;
use League\Flysystem\Filesystem;

class S3Cmd extends FrameCdn
{
    /**
     * @var string
     */
    protected $frameCdnBaseUrl;

    /**
     * @var Cmd
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
     * FrameCdn constructor.
     *
     * @param string        $frameCdnBaseUrl
     * @param string        $cacheDirectory
     * @param Cmd $s3CmdFrameCdn
     * @param \cscntLogger  $logger
     */
    public function __construct(
        $frameCdnBaseUrl,
        $cacheDirectory,
        Cmd $s3CmdFrameCdn
    ) {
        parent::__construct();

        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
        $this->s3CmdFrameCdn   = $s3CmdFrameCdn;
        $this->cacheDirectory  = $cacheDirectory;


        $this->cacheFileSystem = new Filesystem(new Adapter\Local($cacheDirectory));

        $this->currentBatchDirectory = null;
    }

    public function beginBatchTransaction(int $video)
    {
        parent::beginBatchTransaction($video);
        $this->currentBatchDirectory = $this->getTemporaryDirectory();
    }

    /**
     * @param int    $video
     * @param Model\ImageType $imageType
     * @param int            $frameIndex
     * @param string         $imageData
     *
     * @return string
     */
    public function save(int $videoId, Model\ImageType $imageType, int $frameIndex, string $imageData)
    {
        $cdnPath  = sprintf(
            '%s/%s/%s',
            $this->currentBatchDirectory,
            $videoId,
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
            $videoId,
            $imageType->getName(),
            $frameIndex,
            $imageType->getExtension()
        );
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
     * @return string
     */
    private function getTemporaryDirectory()
    {
        do {
            $tempDir = sprintf('%s_%s_%s', 's3_batch_upload', $this->transactionVideo, uniqid());
        } while ($this->cacheFileSystem->has($tempDir));

        $this->cacheFileSystem->createDir($tempDir);

        return $tempDir;
    }
}
