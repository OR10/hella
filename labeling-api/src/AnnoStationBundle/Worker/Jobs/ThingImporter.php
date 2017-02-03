<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Database\Facade;

class ThingImporter extends WorkerPool\Job
{
    /**
     * @var
     */
    private $tasks;

    /**
     * @var string
     */
    private $xmlImportFilePath;

    /**
     * ThingImporter constructor.
     *
     * @param $xmlImportFilePath
     * @param $tasks
     *
     * @internal param \DOMXPath $elements
     * @internal param $thingElement
     */
    public function __construct($xmlImportFilePath, $tasks)
    {
        $this->tasks             = $tasks;
        $this->xmlImportFilePath = $xmlImportFilePath;
    }

    /**
     * @return mixed
     */
    public function getTasks()
    {
        return $this->tasks;
    }

    /**
     * @return string
     */
    public function getXmlImportFilePath(): string
    {
        return $this->xmlImportFilePath;
    }
}
