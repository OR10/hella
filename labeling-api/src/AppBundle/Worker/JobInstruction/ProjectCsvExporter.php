<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Worker\Jobs;

class ProjectCsvExporter extends WorkerPool\JobInstruction
{

    /**
     * @var Service\ProjectExporter\Csv
     */
    private $csvProjectExporter;
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Service\ProjectExporter\Csv $csvProjectExporter
     * @param Facade\Project              $projectFacade
     */
    public function __construct(
        Service\ProjectExporter\Csv $csvProjectExporter,
        Facade\Project $projectFacade
    ) {
        $this->csvProjectExporter = $csvProjectExporter;
        $this->projectFacade      = $projectFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        /** @var Jobs\ProjectCsvExporter $job */

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
