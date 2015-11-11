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

class KittiExporter extends WorkerPool\JobInstruction
{
    /**
     * @var Service\TaskExporter\Kitti
     */
    private $kittiExporter;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Service\TaskExporter\Kitti $kittiExporter
     * @param Facade\LabelingTask        $labelingTaskFacade
     */
    public function __construct(
        Service\TaskExporter\Kitti $kittiExporter,
        Facade\LabelingTask $labelingTaskFacade
    ) {
        $this->kittiExporter      = $kittiExporter;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    public function run(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        $task = $this->labelingTaskFacade->find($job->getLabelingTaskId());
        if ($task === null) {
            // @todo log task-not-found
            return;
        }

        $this->kittiExporter->exportLabelingTask($task);
    }
}
