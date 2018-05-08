<?php

namespace AnnoStationBundle\Worker\Jobs;

use AnnoStationBundle\Service\KpiExport;
use crosscan\WorkerPool;

class KpiProjectToCsv extends WorkerPool\Job
{

    /**
     * @var KpiExport
     */
    private $export;

    /**
     * KpiProjectToCsv constructor.
     *
     * @param KpiExport $export
     */
    public function __construct(KpiExport $export)
    {
        $this->export = $export;
    }

    /**
     * @return KpiExport
     */
    public function getExport()
    {
        return $this->export;
    }
}
