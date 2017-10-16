<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;

class DeleteInvalidLtifLtAndLtgReferences extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $taskId;

    /**
     * @param $taskId
     */
    public function __construct(string $taskId)
    {
        $this->taskId = $taskId;
    }

    /**
     * @return string
     */
    public function getTaskId(): string
    {
        return $this->taskId;
    }
}
