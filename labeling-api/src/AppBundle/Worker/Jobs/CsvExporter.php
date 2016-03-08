<?php
namespace AppBundle\Worker\Jobs;

use crosscan\WorkerPool;

class CsvExporter extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $taskId;

    /**
     * @param string $taskId
     */
    public function __construct($taskId)
    {
        $this->taskId = (string) $taskId;
    }

    /**
     * @return string
     */
    public function getTaskId()
    {
        return $this->taskId;
    }
}
