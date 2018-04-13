<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;

class KpiProjectToCsv extends WorkerPool\Job
{

    /**
     * @var
     */
    private $export;

    /**
     * KpiProjectToCsv constructor.
     *
     * @param $export
     */
    public function __construct( $export)
    {
        $this->export = $export;
    }

    /**
     * @return mixed
     */
    public function getExport()
    {
        return $this->export;
    }
}
