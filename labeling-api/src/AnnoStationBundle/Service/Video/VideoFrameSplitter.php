<?php

namespace AnnoStationBundle\Service\Video;

use GuzzleHttp;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
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
     * @var Flysystem\Filesystem
     */
    private $fileSystem;

    /**
     * @var array
     */
    private $imageSizes = array();

    /**
     * @var string
     */
    private $processingHost;

    /**
     * FrameCdnSplitter constructor.
     *
     * @param Service\FrameCdn     $frameCdn
     * @param string               $ffmpegExecutable
     * @param Flysystem\Filesystem $fileSystem
     * @param string               $processingHost
     */
    public function __construct(
        Service\FrameCdn $frameCdn,
        $ffmpegExecutable,
        Flysystem\Filesystem $fileSystem,
        string $processingHost
    ) {
        $this->ffmpegExecutable = $ffmpegExecutable;
        $this->frameCdn         = $frameCdn;
        $this->fileSystem       = $fileSystem;
        $this->processingHost   = $processingHost;
    }

    /**
     * @param Model\Video    $video
     * @param                $sourceFileFilename
     * @param ImageType\Base $type
     *
     * @return array
     */
    public function splitVideoInFrames(Model\Video $video, string $sourceFileFilename, ImageType\Base $type, bool $isZip = false)
    {
        $httpClient = new GuzzleHttp\Client();
        $response = $httpClient->put(
            $this->processingHost,
            [
                'form_params' => [
                    'videoId' => $video->getId(),
                    'videoName' => $video->getName(),
                    'sourceFileFilename' => $sourceFileFilename,
                    'type' => $type->getName(),
                    'isZip' => $isZip
                ],
                'timeout' => self::TIMEOUT
            ]
        );
        $response = json_decode($response->getBody()->getContents(), true);
        $this->imageSizes = $response['image'];

        return $response['frame'];
    }

    public function imageToFrame(string $projectId, array $imagesParam, ImageType\Base $type)
    {

        $httpClient = new GuzzleHttp\Client();
        $response = $httpClient->put(
            $this->processingHost,
            [
                'form_params' => [
                    'imagesParam' => $imagesParam,
                    'projectId' => $projectId,
                    'type' => $type->getName(),
                    'fileType' => 'images'
                ],
                'timeout' => self::TIMEOUT
            ]
        );

        $response = json_decode($response->getBody()->getContents(), true);

        $this->imageSizes = $response['image'];

        return $response['frame'];
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
    private function getTempDirectory(ImageType\Base $type): string
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
