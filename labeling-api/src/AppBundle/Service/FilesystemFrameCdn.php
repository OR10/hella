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
            "%s/%s/%s.%s",
            [
                $this->frameCdnDir,
                $video->getId(),
                $frameNumber,
                $path,
            ]
        );

        if(!copy($path, $cdnPath)){
            throw new \Exception('Could not copy the file');
        }
    }

    /**
     * @param Model\LabelingTask $labeledFrame
     * @param ImageType\Base     $type
     * @param int                $limit
     * @param int                $offset
     *
     * @return array
     */
    public function getFrameLocations(Model\LabelingTask $labeledFrame, ImageType\Base $type, $limit, $offset = 0)
    {
        // TODO: Frame range check against the labeling task?
        $urls = [];
        foreach (range($offset, $offset + $limit) as $id) {
            $urls[] = vsprintf(
                "%s/%s/%s.%s",
                [
                    $this->frameCdnBaseUrl,
                    $labeledFrame->getVideoId(),
                    $id,
                    $type->getExtension(),
                ]
            );
        }

        return $urls;
    }
}