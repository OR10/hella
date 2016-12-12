<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle\JobInstruction;

class GenericXmlProjectToCsvExporter extends JobInstruction
{
    /**
     * @var Service\Exporter\GenericXmlProjectToCsv
     */
    private $csvExporter;

    /**
     * @param Service\Exporter\GenericXmlProjectToCsv $csvExporter
     */
    public function __construct(Service\Exporter\GenericXmlProjectToCsv $csvExporter)
    {
        $this->csvExporter = $csvExporter;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        try {
            /** @var Jobs\GenericXmlProjectToCsvExporter $job */
            $this->csvExporter->export($job->getExport());
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
        }
    }

    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\GenericXmlProjectToCsvExporter;
    }
}
