<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;

class ProjectDeleter extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $projectId;

    /**
     * @param $projectId
     */
    public function __construct($projectId)
    {
        $this->projectId = (string) $projectId;
    }

    /**
     * @return string
     */
    public function getProjectId(): string
    {
        return $this->projectId;
    }
}
