<?php

namespace Service;

use Service;
use Model;
use League\Flysystem;
use Symfony\Component\Process\Process;

class VideoFrameSplitter
{

    /**
     * Commandline for running ffmpeg to extract images.
     */
    const COMMANDLINE = '%s -i %s %s -v quiet %s/%s.%s';

    /**
     * Timeout for ffmpeg process in seconds.
     */
    const TIMEOUT = 3600;

    /**
     * @var string
     */
    private $ffmpegExecutable;

    /**
     * @var Service\FrameCdn
     */
    private $frameCdn;

    /**
     * @var Service\VideoCdn
     */
    private $videoCdn;

    /**
     * @var Flysystem\Filesystem
     */
    private $fileSystem;

    /**
     * @var array
     */
    private $imageSizes = array();

    /**
     * FrameCdnSplitter constructor.
     *
     * @param Service\FrameCdn     $frameCdn
     * @param Service\VideoCdn     $videoCdn
     * @param string               $ffmpegExecutable
     * @param Flysystem\Filesystem $fileSystem
     */
    public function __construct(
        $frameCdn,
        $videoCdn,
        $ffmpegExecutable,
        Flysystem\Filesystem $fileSystem
    ) {
        $this->ffmpegExecutable = $ffmpegExecutable;
        $this->frameCdn         = $frameCdn;
        $this->videoCdn         = $videoCdn;
        $this->fileSystem       = $fileSystem;
    }

    /**
     * @param string     $videoId
     * @param string  $sourceFileFilename
     * @param string  $type
     *
     * @return array
     */
    public function splitVideoInFrames(string $videoId, string $videoName, string $sourceFileFilename, string $type, string $cacheDir)
    {
        $type = Model\ImageType::create($type);
        $tempDir = $this->getTempDirectory($type);

        $tmpFile = $this->createTemporaryFileForVideo($videoName,$cacheDir);

        if (file_put_contents($tmpFile, $this->videoCdn->getFile($sourceFileFilename)) === false) {
            throw new \RuntimeException("Error writing video data to temporary file '{$tmpFile}'");
        }

        try {
            $prefixedTempDir = $this->fileSystem->getAdapter()->applyPathPrefix($tempDir);
            $command = $this->getCommand($tmpFile, $type, $prefixedTempDir);

            // place to call api
            $process = new Process($command);
            $process->setTimeout(self::TIMEOUT);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \RuntimeException($process->getErrorOutput());
            }

            $files = array_filter(
                $this->fileSystem->listContents($tempDir),
                function ($file) use ($type) {
                    if ($file['extension'] === $type->getExtension()) {
                        return true;
                    }

                    return false;
                }
            );

            $this->frameCdn->beginBatchTransaction((string)$videoId);
            $frameSizesInBytes = [];
            foreach ($files as $file) {
                $this->imageSizes[(int) $file['basename']] = getimagesizefromstring(
                    $this->fileSystem->read($file['path'])
                );

                $cdnPath = $this->frameCdn->save(
                    $videoId,
                    $type,
                    (int) $file['basename'],
                    $this->fileSystem->read($file['path'])
                );
                $frameSizesInBytes[$cdnPath] = $this->fileSystem->getSize($file['path']);
            }
            $this->frameCdn->commit();

            return $frameSizesInBytes;
        } finally {
            if (!unlink($tmpFile)) {
                throw new \RuntimeException("Error removing temporary file '{$tmpFile}'");
            }
            if (!$this->fileSystem->deleteDir($tempDir)) {
                throw new \RuntimeException("Error removing temporary directory '{$tempDir}'");
            }
        }
    }

    /**
     * @param                $sourceFileName
     * @param Model\ImageType $type
     * @param                $tempDir
     *
     * @return string
     */
    private function getCommand($sourceFileName, Model\ImageType $type, $tempDir)
    {
        return sprintf(
            self::COMMANDLINE,
            $this->ffmpegExecutable,
            $sourceFileName,
            $type->getCommandParameters(),
            $tempDir,
            '%d',
            $type->getExtension()
        );
    }

    /**
     * @param Model\ImageType $type
     *
     * @return string
     */
    private function getTempDirectory(Model\ImageType $type): string
    {

        $tempDir = sprintf('%s_%s_%s', 'video', $type->getName(), uniqid());

        if ($this->fileSystem->has(($tempDir))) {
            if (!$this->fileSystem->deleteDir($tempDir)) {
                $this->fileSystem->delete($tempDir);
            }
        }
        $this->fileSystem->createDir($tempDir);

        return $tempDir;
    }

    /**
     * @return array
     */
    public function getImageSizes()
    {
        return $this->imageSizes;
    }

    /**
     * Create a temporary file and return its filepath for the given video
     *
     * The temporary file will have the same file extension as the original video.
     *
     * @param string $video
     *
     * @return string
     */
    private function createTemporaryFileForVideo(string $videoName, string $cacheDir)
    {
        $videoFileExtension = \pathinfo($videoName, PATHINFO_EXTENSION);

        $tmpFile = null;
        do {
            $tmpFile = $cacheDir
                . '/'
                . 'source_video_'
                . \hash('sha256', \openssl_random_pseudo_bytes(256 / 8))
                . '.'
                . $videoFileExtension;
        } while (\file_exists($tmpFile));

        if (\touch($tmpFile) === false) {
            throw new \RuntimeException('Error creating temporary file for video data');
        };

        return $tmpFile;
    }
}
