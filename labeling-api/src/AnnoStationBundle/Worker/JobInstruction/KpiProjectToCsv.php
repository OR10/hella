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
     * @var Service\KpiExport
     */
    private $kpiExport;

    /**
     * KpiProjectToCsv constructor.
     *
     * @param Service\KpiExport $kpiExporter
     */
    public function __construct(Service\KpiExport $kpiExporter)
    {
        $this->kpiExport = $kpiExporter;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        try {
            /** @var Jobs\KpiProjectToCsv $job */
            $this->kpiExport->build($job->getExport());
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
