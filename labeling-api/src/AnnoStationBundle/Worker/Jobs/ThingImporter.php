<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Database\Facade;

class ThingImporter extends WorkerPool\Job
{
    /**
     * @var array
     */
    private $taskIds = [];

    /**
     * @var string
     */
    private $xmlImportFilePath;

    /**
     * ThingImporter constructor.
     *
     * @param $xmlImportFilePath
     * @param $taskIds
     */
    public function __construct($xmlImportFilePath, $taskIds)
    {
        $this->taskIds           = $taskIds;
        $this->xmlImportFilePath = $xmlImportFilePath;
    }

    /**
     * @return array
     */
    public function getTaskIds()
    {
        return $this->taskIds;
    }

    /**
     * @return string
     */
    public function getXmlImportFilePath(): string
    {
        return $this->xmlImportFilePath;
    }
}
