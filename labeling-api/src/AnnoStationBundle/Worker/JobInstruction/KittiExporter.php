<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AppBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;

class KittiExporter extends WorkerPoolBundle\JobInstruction
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
        /** @var Jobs\KittiExporter $job */
        $task = $this->labelingTaskFacade->find($job->getTaskId());
        if ($task === null) {
            // @todo log task-not-found
            return;
        }

        $this->kittiExporter->exportLabelingTask($task);
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\KittiExporter;
    }
}
