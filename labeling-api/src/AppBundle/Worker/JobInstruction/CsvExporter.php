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

class CsvExporter extends WorkerPool\JobInstruction
{
    /**
     * @var Service\TaskExporter\Csv
     */
    private $CsvExporter;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Service\TaskExporter\Csv $CsvExporter
     * @param Facade\LabelingTask        $labelingTaskFacade
     */
    public function __construct(
        Service\TaskExporter\Csv $CsvExporter,
        Facade\LabelingTask $labelingTaskFacade
    ) {
        $this->CsvExporter        = $CsvExporter;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        $task = $this->labelingTaskFacade->find($job->getTaskId());
        if ($task === null) {
            // @todo log task-not-found
            return;
        }

        $this->CsvExporter->exportLabelingTask($task);
    }
}
