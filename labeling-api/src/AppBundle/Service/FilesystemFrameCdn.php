<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;

class FilesystemFrameCdn extends FrameCdn
{
    /**
     * @var string
     */
    protected $frameCdnDir;
    /**
     * @var string
     */
    protected $frameCdnBaseUrl;

    /**
     * FrameCdn constructor.
     *
     * @param string $frameCdnDir
     * @param string $frameCdnBaseUrl
     */
    public function __construct($frameCdnDir, $frameCdnBaseUrl)
    {
        $this->frameCdnDir     = $frameCdnDir;
        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameNumber
     * @param string         $path
     *
     * @return void
     * @throws \Exception
     */
    public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, $frameNumber, $path)
    {
        $cdnPath = vsprintf(
            "%s/%s/%s",
            [
                $this->frameCdnDir,
                $video->getId(),
                $imageType->getName()
            ]
        );

        if (!is_dir($cdnPath)) {
            mkdir($cdnPath, 0777, true);
        }

        $filePath = sprintf(
            '%s/%s.%s',
            $cdnPath,
            $frameNumber,
            $imageType->getExtension()
        );

        if (!copy($path, $filePath)) {
            throw new \Exception('Could not copy the file');
        }
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
        // TODO: Frame range check against the labeling task?
        $urls = [];
        foreach (range($frameRange->getStartFrameNumber(), $frameRange->getEndFrameNumber()) as $frameNumber) {
            $urls[] = vsprintf(
                "%s/%s/%s/%s.%s",
                [
                    $this->frameCdnBaseUrl,
                    $labelingTask->getVideoId(),
                    $imageType->getName(),
                    $frameNumber,
                    $imageType->getExtension(),
                ]
            );
        }

        return $urls;
    }
}
