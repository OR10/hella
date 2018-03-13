<?php

namespace AnnoStationBundle\Service\VideoCdn;

use AnnoStationBundle\Service;
use AppBundle\Model;
use crosscan\Logger\Facade\LoggerFacade;

class Azure extends Service\VideoCdn
{

    /**
     * @var Service\Azure
     */
    private $azureVideo;

    /**
     * FrameCdn constructor.
     *
     * @param Service\Azure $azureVideo
     */
    public function __construct(Service\Azure $azureVideo)
    {
        $this->azureVideo = $azureVideo;
    }

    /**
     * @param Model\Video $video
     * @param             $source
     *
     * @return mixed
     */
    public function saveVideo(Model\Video $video, $source)
    {
        $this->azureVideo->uploadFile(
            $video,
            fopen($source, "r")
        );
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed
     */
    public function getVideo(Model\Video $video)
    {
        return $this->azureVideo->getFile($video->getSourceVideoPath());
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed|void
     */
    public function deleteVideoDirectory(Model\Video $video)
    {

    }
}