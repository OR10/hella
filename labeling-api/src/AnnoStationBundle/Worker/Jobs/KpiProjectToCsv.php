<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model;

class KpiProjectToCsv extends WorkerPool\Job
{
    /**
     * @var Model\Export
     */
    private $export;

    /**
     * @param Model\Export $export
     */
    public function __construct(Model\Export $export)
    {
        $this->export = $export;
    }

    /**
     * @return Model\Export
     */
    public function getExport(): Model\Export
    {
        return $this->export;
    }
}
