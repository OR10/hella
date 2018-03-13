<?php

namespace Service\Storage;

use Model;
use League\Flysystem\Adapter;
use League\Flysystem\Filesystem;
use Service\Azure;

class AzureCmd
{
    /**
     * @var Azure
     */
    private $s3CmdCdn;

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
     * Cdn constructor.
     *
     * @param string        $cacheDirectory
     * @param Azure $s3CmdCdn
     */
    public function __construct(
        $cacheDirectory,
        Azure $s3CmdCdn
    ) {
        $this->s3CmdCdn        = $s3CmdCdn;
        $this->cacheDirectory  = $cacheDirectory;


        $this->cacheFileSystem = new Filesystem(new Adapter\Local($cacheDirectory));

        $this->currentBatchDirectory = null;
    }

    /**
     * @param string $fileSourcePath
     * @return string
     */
    public function getFile(string $fileSourcePath)
    {
        return $this->s3CmdCdn->getFile($fileSourcePath);
    }

    /**
     *
     * @param string $videoId
     */
    public function beginBatchTransaction(string $videoId)
    {
        $this->currentBatchDirectory = $this->getTemporaryDirectory();
    }

    /**
     * @param string    $videoId
     * @param Model\ImageType $imageType
     * @param int            $frameIndex
     * @param string         $imageData
     *
     * @return string
     */
    public function save(string $videoId, Model\ImageType $imageType, int $frameIndex, string $imageData)
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

    /**
     *
     * @throws \RuntimeException
     */
    public function commit()
    {
        $batchDirectoryFullPath = sprintf('%s/%s', $this->cacheDirectory, $this->currentBatchDirectory);

        try {
            $this->s3CmdCdn->uploadDirectory($batchDirectoryFullPath);
        } finally {
            if (!$this->cacheFileSystem->deleteDir($this->currentBatchDirectory)) {
                throw new \RuntimeException("Error removing temporary directory '{$this->currentBatchDirectory}'");
            }
        }

        $this->currentBatchDirectory = null;
    }

    /**
     * @return string
     */
    private function getTemporaryDirectory()
    {
        do {
            $tempDir = sprintf('%s_%s_%s', 'azure_batch_upload', $this->transactionVideo, uniqid());
        } while ($this->cacheFileSystem->has($tempDir));

        $this->cacheFileSystem->createDir($tempDir);

        return $tempDir;
    }
}