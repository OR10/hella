<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use League\Flysystem;

class FilesystemFrameCdn extends FrameCdn
{
    /**
     * @var string
     */
    protected $frameCdnBaseUrl;
    /**
     * @var Flysystem\FileSystem
     */
    private $fileSystem;

    /**
     * FrameCdn constructor.
     *
     * @param string               $frameCdnBaseUrl
     * @param Flysystem\FileSystem $fileSystem
     */
    public function __construct($frameCdnBaseUrl, Flysystem\FileSystem $fileSystem)
    {
        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
        $this->fileSystem      = $fileSystem;
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameNumber
     * @param string         $imageData
     *
     * @return void
     * @throws \Exception
     */
    public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, $frameNumber, $imageData)
    {
        $cdnPath  = sprintf('%s/%s', $video->getId(), $imageType->getName());
        $filePath = sprintf('%s/%s.%s', $cdnPath, $frameNumber, $imageType->getExtension());

        $this->fileSystem->createDir($cdnPath);
        $this->fileSystem->write($filePath, $imageData);
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param ImageType\Base     $imageType
     * @param Model\FrameRange   $frameRange
     *
     * @return array
     */
    public function getFrameLocations(
        Model\LabelingTask $labelingTask,
        ImageType\Base $imageType,
        Model\FrameRange $frameRange
    ) {
        $urls = [];
        foreach (range($frameRange->getStartFrameNumber(), $frameRange->getEndFrameNumber()) as $frameNumber) {
            $urls[] = [
                'id' => "{$labelingTask->getId()}-{$frameNumber}",
                "frameNumber" => $frameNumber,
                'url' => sprintf(
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
}
