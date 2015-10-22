<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use Doctrine\ODM\CouchDB;

class FrameCdn
{
    /**
     * @param Model\LabelingTask $labeledFrame
     * @param ImageType\Base     $type
     *
     * @return array
     */
    public function getFrameLocations(Model\LabelingTask $labeledFrame, ImageType\Base $type, $limit, $offset = 0)
    {
        $urls = [];
        foreach (range($offset, $offset + $limit) as $id) {
            $urls[] = vsprintf(
                "%s/%s/%s.%s",
                [
                    "https://placehold.it/1280x720",
                    $labeledFrame->getVideoId(),
                    $id,
                    $type->getExtension(),
                ]
            );
        }

        return $urls;
    }
}