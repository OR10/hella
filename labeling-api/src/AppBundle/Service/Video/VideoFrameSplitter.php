<?php

namespace AppBundle\Service\Video;

use Symfony\Component\Process\Process;
use AppBundle\Model\Video\ImageType;
use AppBundle\Service;
use AppBundle\Model;

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
     * FrameCdnSplitter constructor.
     *
     * @param Service\FilesystemFrameCdn $filesystemFrameCdn
     * @param                            $ffmpegExecutable
     * @param                            $cacheDir
     */
    public function __construct(Service\FilesystemFrameCdn $filesystemFrameCdn, $ffmpegExecutable, $cacheDir)
    {
        $this->ffmpegExecutable   = $ffmpegExecutable;
        $this->cacheDir           = $cacheDir;
        $this->filesystemFrameCdn = $filesystemFrameCdn;
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
            $tempDir
        );

        $process = new Process($command);
        $process->setTimeout(3600);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput());
        }

        foreach (glob($tempDir . '/*.' . $type->getExtension()) as $filename) {
            $this->filesystemFrameCdn->save($video, $type, (int) basename($filename), $filename);
            unlink(($filename));
        }

        rmdir($tempDir);
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

        $prefix  = sprintf(
            '%s_%s_',
            'video',
            $type->getName()
        );
        $tempDir = tempnam(
            sprintf(
                '%s',
                $this->cacheDir
            ),
            $prefix
        );

        if (is_file($tempDir)) {
            unlink($tempDir);
        }
        if (is_dir($tempDir)) {
            rmdir($tempDir);
        }
        mkdir($tempDir, 0777, true);

        return $tempDir;
    }
}