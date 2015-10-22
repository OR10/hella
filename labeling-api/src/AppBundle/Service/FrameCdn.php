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
     * @param string $path
     *
     * @return mixed
     */
    abstract public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, $frameNumber, $path);

    /**
     * @param Model\LabelingTask $labeledFrame
     * @param ImageType\Base     $type
     * @param int                $limit
     * @param int                $offset
     *
     * @return array
     */
    abstract public function getFrameLocations(
        Model\LabelingTask $labeledFrame,
        ImageType\Base $type,
        $limit,
        $offset = 0
    );
}