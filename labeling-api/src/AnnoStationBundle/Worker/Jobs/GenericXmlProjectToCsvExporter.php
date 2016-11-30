<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model;

class GenericXmlProjectToCsvExporter extends WorkerPool\Job
{
    /**
     * @var Model\Export
     */
    private $export;

    /**
     * GenericXmlProjectToCsvExporter constructor.
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
