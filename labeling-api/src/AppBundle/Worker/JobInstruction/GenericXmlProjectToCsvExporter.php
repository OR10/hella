<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AppBundle\Service;
use AppBundle\Worker\Jobs;

class GenericXmlProjectToCsvExporter extends WorkerPool\JobInstruction
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
    public function run(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        try {
            /** @var Jobs\GenericXmlProjectToCsvExporter $job */
            $this->csvExporter->export($job->getExport());
        }catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        }
    }
}
