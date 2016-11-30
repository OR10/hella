<?php
namespace AppBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AppBundle\Database\Facade;

class VideoFrameSplitter extends WorkerPool\Job
{
    /**
     * @var int
     */
    private $videoId;
    /**
     * @var string
     */
    private $path;
    /**
     * @var string
     */
    private $imageType;

    /**
     * Video constructor.
     * @param                $videoId
     * @param                $path
     * @param ImageType\Base $imageType
     */
    public function __construct(
        $videoId,
        $path,
        ImageType\Base $imageType
    ) {
        $this->videoId   = $videoId;
        $this->path      = $path;
        $this->imageType = $imageType;
    }

    public function __get($name)
    {
        return $this->$name;
    }
}
