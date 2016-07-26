<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool\Job;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use League\Flysystem;
use Doctrine\ODM\CouchDB;
use AppBundle\Model\Video\ImageType;

class Report extends WorkerPool\JobInstruction
{
    /**
     * @var Service\Report
     */
    private $reportService;

    /**
     * @var Facade\Report
     */
    private $reportFacade;

    /**
     * @param Service\Report $reportingService
     * @param Facade\Report  $reportFacade
     */
    public function __construct(
        Service\Report $reportingService,
        Facade\Report $reportFacade
    )
    {
        $this->reportService = $reportingService;
        $this->reportFacade  = $reportFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        $report = $this->reportFacade->find($job->getReportId());
        if ($report === null) {
            // @todo log report-not-found
            return;
        }

        $this->reportService->processReport($report);
    }
}
