<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AppBundle\Service;
use AppBundle\Worker\Jobs;

class LegacyProjectToCsvExporter extends WorkerPool\JobInstruction
{
    /**
     * @var Service\Exporter\LegacyProjectToCsv
     */
    private $csvProjectExporter;

    /**
     * @param Service\Exporter\LegacyProjectToCsv $csvProjectExporter
     */
    public function __construct(Service\Exporter\LegacyProjectToCsv $csvProjectExporter)
    {
        $this->csvProjectExporter = $csvProjectExporter;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        try {
            /** @var Jobs\LegacyProjectToCsvExporter $job */
            $this->csvProjectExporter->exportProject($job->getExport());
        }catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
        }
    }
}
