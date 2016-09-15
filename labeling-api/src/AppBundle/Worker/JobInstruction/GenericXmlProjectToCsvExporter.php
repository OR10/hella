<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Worker\Jobs;

class GenericXmlProjectToCsvExporter extends WorkerPool\JobInstruction
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Exporter\GenericXmlProjectToCsv
     */
    private $csvExporter;

    /**
     * @param Service\Exporter\GenericXmlProjectToCsv $csvExporter
     * @param Facade\Project                          $projectFacade
     */
    public function __construct(Service\Exporter\GenericXmlProjectToCsv $csvExporter, Facade\Project $projectFacade)
    {
        $this->projectFacade = $projectFacade;
        $this->csvExporter   = $csvExporter;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        /** @var Jobs\GenericXmlProjectToCsvExporter $job */

        $project = $this->projectFacade->find($job->getProjectId());

        if ($project === null) {
            $logger->logString(
                sprintf('Project not found with id: %s', $job->getProjectId()),
                \cscntLogPayload::SEVERITY_ERROR
            );

            return;
        }

        $this->csvExporter->export($project);
    }
}
