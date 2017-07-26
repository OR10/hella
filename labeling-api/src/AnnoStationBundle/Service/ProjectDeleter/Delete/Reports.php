<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class Reports
{
    /**
     * @var Facade\Report
     */
    private $reportFacade;

    public function __construct(Facade\Report $reportFacade)
    {
        $this->reportFacade = $reportFacade;
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\Project $project)
    {
        $reports = $this->reportFacade->findAllByProject($project);
        foreach ($reports as $report) {
            $this->reportFacade->delete($report);
        }
    }
}
