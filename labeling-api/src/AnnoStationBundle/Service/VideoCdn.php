<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;

abstract class VideoCdn
{
    /**
     * @param Model\Video $video
     * @param             $source
     *
     * @return mixed
     */
    abstract public function saveVideo(
        Model\Video $video,
        $source
    );

    /**
     * @param Model\Video $video
     *
     * @return mixed
     */
    abstract public function getVideo(
        Model\Video $video
    );

    /**
     * @param Model\Video    $video
     *
     * @return mixed
     */
    abstract public function deleteVideoDirectory(
        Model\Video $video
    );
}
