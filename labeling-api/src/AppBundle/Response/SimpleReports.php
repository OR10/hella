<?php

namespace AppBundle\Response;

use AppBundle\Model;

class SimpleReports
{
    /**
     * @var Model\Report[]
     */
    private $result = [];

    /**
     * @param $reports
     */
    public function __construct(
        $reports
    )
    {
        $this->result = array_map(function (Model\Report $report) {
            return [
                'id' => $report->getId(),
                'reportCreationDate' => $report->getReportCreationDate(),
                'reportStatus' => $report->getReportStatus(),
                'projectId' => $report->getProjectId(),
            ];
        }, $reports);
    }
}
