<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool\Job;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use League\Flysystem;
use Doctrine\ODM\CouchDB;
use AppBundle\Model\Video\ImageType;

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
     * @param Facade\Project $projectFacade
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
        $project = $this->projectFacade->find($job->getProjectId());
        if ($project === null) {
            // @todo log project-not-found
            return;
        }

        $this->csvProjectExporter->exportProject($project);
    }
}
