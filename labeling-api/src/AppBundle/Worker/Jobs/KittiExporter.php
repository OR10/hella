<?php
namespace AppBundle\Worker\Jobs;

use crosscan\WorkerPool;

class KittiExporter extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $labelingTaskId;

    /**
     * @param string $labelingTaskId
     */
    public function __construct($labelingTaskId)
    {
        $this->labelingTaskId = $labelingTaskId;
    }

    public function getLabelingTaskId()
    {
        return $this->labelingTaskId;
    }
}
