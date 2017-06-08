<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Database\Facade;

class TaskDocumentsToTaskDatabase extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $taskId;

    /**
     * TaskDocumentsToTaskDatabase constructor.
     *
     * @param $taskId
     */
    public function __construct($taskId)
    {
        $this->taskId = $taskId;
    }

    /**
     * @return array
     */
    public function getTaskId()
    {
        return $this->taskId;
    }
}
