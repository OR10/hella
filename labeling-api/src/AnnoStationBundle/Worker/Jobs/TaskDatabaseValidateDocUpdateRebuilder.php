<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;

class TaskDatabaseValidateDocUpdateRebuilder extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $projectId;

    /**
     * @var string
     */
    private $taskId;

    public function __construct(string $projectId, string $taskId)
    {
        $this->projectId = $projectId;
        $this->taskId    = $taskId;
    }

    /**
     * @return mixed
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * @return mixed
     */
    public function getProjectId()
    {
        return $this->projectId;
    }
}