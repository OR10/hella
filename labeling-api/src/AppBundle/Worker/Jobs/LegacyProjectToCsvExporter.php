<?php
namespace AppBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model;

class LegacyProjectToCsvExporter extends WorkerPool\Job
{
    /**
     * @var Model\ProjectExport
     */
    private $projectExport;

    /**
     * @param Model\ProjectExport $projectExport
     *
     */
    public function __construct(Model\ProjectExport $projectExport)
    {
        $this->projectExport = $projectExport;
    }

    /**
     * @return Model\ProjectExport
     */
    public function getProjectExport(): Model\ProjectExport
    {
        return $this->projectExport;
    }
}
