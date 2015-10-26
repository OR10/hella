<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use Doctrine\ODM\CouchDB;

abstract class FrameCdn
{
    /**
     * @param Model\Video $video
     * @param ImageType\Base $imageType
     * @param int $frameNumber
     * @param string $imageData
     *
     * @return mixed
     */
    abstract public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, $frameNumber, $imageData);

    /**
     * @param Model\LabelingTask $labeledFrame
     * @param ImageType\Base     $imageType
     * @param Model\FrameRange   $frameRange
     *
     * @return array
     */
    abstract public function getFrameLocations(
        Model\LabelingTask $labeledFrame,
        ImageType\Base $imageType,
        Model\FrameRange $frameRange
    );
}
