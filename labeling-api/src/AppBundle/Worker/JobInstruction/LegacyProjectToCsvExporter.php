<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Worker\Jobs;

class LegacyProjectToCsvExporter extends WorkerPool\JobInstruction
{
    /**
     * @var Service\Exporter\LegacyProjectToCsv
     */
    private $csvProjectExporter;
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Service\Exporter\LegacyProjectToCsv $csvProjectExporter
     * @param Facade\Project                      $projectFacade
     */
    public function __construct(Service\Exporter\LegacyProjectToCsv $csvProjectExporter, Facade\Project $projectFacade)
    {
        $this->csvProjectExporter = $csvProjectExporter;
        $this->projectFacade      = $projectFacade;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(WorkerPool\Job $job, Logger\Facade\LoggerFacade $logger)
    {
        /** @var Jobs\LegacyProjectToCsvExporter $job */

        $project = $this->projectFacade->find($job->getProjectId());
        if ($project === null) {
            $logger->logString(
                sprintf('Project not found, id: %s', $job->getProjectId()),
                \cscntLogPayload::SEVERITY_ERROR
            );

            return;
        }

        $this->csvProjectExporter->exportProject($project);
    }
}
