<?php

namespace AnnoStationBundle\Service\Video;

use Symfony\Component\Process\Process;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service as AnnoStationService;
use AppBundle\Model;
use League\Flysystem;

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
     * @param AnnoStationService\FrameCdn $frameCdn
     * @param string                      $ffmpegExecutable
     * @param Flysystem\Filesystem        $fileSystem
     */
    public function __construct(
        AnnoStationService\FrameCdn $frameCdn,
        $ffmpegExecutable,
        Flysystem\Filesystem $fileSystem
    ) {
        $this->ffmpegExecutable = $ffmpegExecutable;
        $this->frameCdn         = $frameCdn;
        $this->fileSystem       = $fileSystem;
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
        $tempDir         = $this->getTempDirectory($type);

        try {
            $prefixedTempDir = $this->fileSystem->getAdapter()->applyPathPrefix($tempDir);
            $command         = $this->getCommand($sourceFileFilename, $type, $prefixedTempDir);

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

            $this->frameCdn->beginBatchTransaction($video);
            foreach ($files as $file) {
                $this->imageSizes[(int) $file['basename']] = getimagesizefromstring(
                    $this->fileSystem->read($file['path'])
                );
                $this->frameCdn->save(
                    $video,
                    $type,
                    (int) $file['basename'],
                    $this->fileSystem->read($file['path'])
                );
            }
            $this->frameCdn->commit();
        } finally {
            if (!$this->fileSystem->deleteDir($tempDir)) {
                throw new \RuntimeException("Error removing temporary directory '{$tempDir}'");
            }
        }
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
     * @param ImageType\Base $type
     *
     * @return string
     */
    private function getTempDirectory(ImageType\Base $type)
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
}