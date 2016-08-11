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

class Exporter extends WorkerPool\JobInstruction
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Exporter\Csv
     */
    private $csvExporter;

    /**
     * @param Service\Exporter\Csv $csvExporter
     * @param Facade\Project     $projectFacade
     */
    public function __construct(
        Service\Exporter\Csv $csvExporter,
        Facade\Project $projectFacade
    )
    {
        $this->projectFacade = $projectFacade;
        $this->csvExporter   = $csvExporter;
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

        $this->csvExporter->export($project);
    }
}
