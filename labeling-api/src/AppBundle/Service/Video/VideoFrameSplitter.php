<?php

namespace AppBundle\Service\Video;

use Symfony\Component\Process\Process;
use AppBundle\Model\Video\ImageType;
use AppBundle\Service;
use AppBundle\Model;
use League\Flysystem;

class VideoFrameSplitter
{
    /**
     * @var string
     */
    private $ffmpegExecutable;

    /**
     * @var string
     */
    private $cacheDir;
    /**
     * @var Service\FilesystemFrameCdn
     */
    private $filesystemFrameCdn;

    /**
     * @var Flysystem\FileSystem
     */
    private $fileSystem;

    /**
     * FrameCdnSplitter constructor.
     *
     * @param Service\FilesystemFrameCdn $filesystemFrameCdn
     * @param                            $ffmpegExecutable
     * @param                            $cacheDir
     * @param Flysystem\FileSystem       $fileSystem
     */
    public function __construct(
        Service\FilesystemFrameCdn $filesystemFrameCdn,
        $ffmpegExecutable,
        $cacheDir,
        Flysystem\FileSystem $fileSystem
    ) {
        $this->ffmpegExecutable   = $ffmpegExecutable;
        $this->cacheDir           = $cacheDir;
        $this->filesystemFrameCdn = $filesystemFrameCdn;
        $this->fileSystem         = $fileSystem;
    }

    /**
     * @param Model\Video    $video
     * @param                $sourceFileFilename
     * @param ImageType\Base $type
     *
     * @throws \Exception
     */
    public function splitVideoInFrames(Model\Video $video, $sourceFileFilename, ImageType\Base $type)
    {
        $tempDir = $this->getTempDirectory($type);
        $command = $this->getCommand(
            $sourceFileFilename,
            $type,
            $this->cacheDir . '/' . $tempDir
        );

        $process = new Process($command);
        $process->setTimeout(3600);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput());
        }

        $pattern = sprintf(
            '%s/%s/%s',
            $this->cacheDir,
            $tempDir,
            $type->getExtension()
        );
        foreach (glob($pattern) as $filename) {
            $this->filesystemFrameCdn->save($video, $type, (int) basename($filename), $filename);
            $this->fileSystem->delete($tempDir . '/' . basename($filename));
        }

        $this->fileSystem->deleteDir($tempDir);
    }

    /**
     * @param                $sourceFileName
     * @param ImageType\Base $type
     * @param                $tempDir
     *
     * @return string
     */
    private function getCommand($sourceFileName, ImageType\Base $type, $tempDir)
    {
        return sprintf(
            '%s -i %s %s %s/%s.%s',
            $this->ffmpegExecutable,
            $sourceFileName,
            $type->getCommandParameters(),
            $tempDir,
            '%d',
            $type->getExtension()
        );
    }

    /**
     * @param ImageType\Base $type
     *
     * @return string
     */
    private function getTempDirectory(ImageType\Base $type)
    {

        $tempDir = sprintf(
            '%s_%s_%s',
            'video',
            $type->getName(),
            uniqid()
        );

        if ($this->fileSystem->has(($tempDir))) {
            $this->fileSystem->delete($tempDir);
        }
        if (is_dir($tempDir)) {
            $this->fileSystem->deleteDir($tempDir);
        }
        $this->fileSystem->createDir($tempDir);

        return $tempDir;
    }
}