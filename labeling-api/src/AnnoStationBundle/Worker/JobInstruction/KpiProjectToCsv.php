<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;

class KpiProjectToCsv extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Service\Exporter\LegacyProjectToCsv
     */
  //  private $csvProjectExporter;

    /**
     * @param Service\Exporter\LegacyProjectToCsv $csvProjectExporter
     */
  //  public function __construct(Service\Exporter\LegacyProjectToCsv $csvProjectExporter)
 //   {
      //  $this->csvProjectExporter = $csvProjectExporter;
 //   }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        try {
            // add Kpi export service
           // $this->csvProjectExporter->exportProject($job->getExport());
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
        }
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\KpiProjectToCsv;
    }
}
