<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model;

class RequirementsProjectToXml extends WorkerPool\Job
{
    /**
     * @var Model\Export
     */
    private $export;

    /**
     * RequirementsProjectToXml constructor.
     *
     * @param Model\Export $export
     */
    public function __construct(Model\Export $export)
    {
        $this->export = $export;
    }

    /**
     * @return Model\Export
     */
    public function getExport()
    {
        return $this->export;
    }
}
