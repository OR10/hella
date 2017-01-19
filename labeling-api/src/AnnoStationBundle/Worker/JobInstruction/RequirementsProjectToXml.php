<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle\JobInstruction;

class RequirementsProjectToXml extends JobInstruction
{
    /**
     * @var Service\Exporter\RequirementsProjectToXml
     */
    private $requirementsProjectToXml;

    /**
     * @param Service\Exporter\RequirementsProjectToXml $requirementsProjectToXml
     */
    public function __construct(Service\Exporter\RequirementsProjectToXml $requirementsProjectToXml)
    {
        $this->requirementsProjectToXml = $requirementsProjectToXml;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        try {
            /** @var Jobs\GenericXmlProjectToCsvExporter $job */
            $this->requirementsProjectToXml->export($job->getExport());
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
        }
    }

    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\RequirementsProjectToXml;
    }
}
