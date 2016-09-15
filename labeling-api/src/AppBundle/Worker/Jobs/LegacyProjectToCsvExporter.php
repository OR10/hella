<?php
namespace AppBundle\Worker\Jobs;

use crosscan\WorkerPool;

class LegacyProjectToCsvExporter extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $projectId;

    /**
     * @param string $projectId
     */
    public function __construct(string $projectId)
    {
        $this->projectId = $projectId;
    }

    /**
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }
}
