<?php
namespace AppBundle\Worker\Jobs;

use crosscan\WorkerPool;

class ProjectCsvExporter extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $projectId;

    /**
     * @param string $projectId
     */
    public function __construct($projectId)
    {
        $this->projectId = (string) $projectId;
    }

    /**
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }
}
