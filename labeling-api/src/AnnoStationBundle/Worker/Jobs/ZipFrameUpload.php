<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Database\Facade;

class ZipFrameUpload extends WorkerPool\Job
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
     * @var string[]
     */
    private $imageTypes;

    /**
     * ZipFrameUpload constructor.
     * @param string $videoId
     * @param string $path
     * @param array $imageTypes
     */
    public function __construct(
        string $videoId,
        string $path,
        array $imageTypes
    ) {
        $this->videoId   = $videoId;
        $this->path      = $path;
        $this->imageTypes = $imageTypes;
    }

    /**
     * @param $name
     * @return mixed
     */
    public function __get($name)
    {
        return $this->$name;
    }
}
