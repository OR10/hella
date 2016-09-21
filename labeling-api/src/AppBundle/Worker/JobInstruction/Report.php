<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Worker\Jobs;


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
    ) {
        $this->reportService = $reportingService;
        $this->reportFacade  = $reportFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        /** @var Jobs\Report $job */
        $report = $this->reportFacade->find($job->getReportId());
        if ($report === null) {
            $logger->logString(
                sprintf('No report found for id %s', $job->getReportId()),
                \cscntLogPayload::SEVERITY_WARNING
            );

            return;
        }

        try {
            $this->reportService->processReport($report);
        }catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        }
    }
}
