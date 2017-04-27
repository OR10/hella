<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Database\Facade;

class LabelingTaskRemoveAssignment extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $taskId;

    /**
     * @var string
     */
    private $userId;

    public function __construct(string $userId, string $taskId)
    {
        $this->taskId = $taskId;
        $this->userId = $userId;
    }

    /**
     * @return string
     */
    public function getTaskId(): string
    {
        return $this->taskId;
    }

    /**
     * @return string
     */
    public function getUserId(): string
    {
        return $this->userId;
    }
}