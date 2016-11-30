<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;

class Report extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $reportId;

    /**
     * @param $reportId
     */
    public function __construct($reportId)
    {
        $this->reportId = (string) $reportId;
    }

    /**
     * @return string
     */
    public function getReportId()
    {
        return $this->reportId;
    }
}
