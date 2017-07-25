<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Database\Facade;

class DeleteProjectAssignmentsForUserJobCreator extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $userId;

    /**
     * @var array
     */
    private $projectIds;

    public function __construct(string $userId, array $projectIds)
    {
        $this->userId     = $userId;
        $this->projectIds = $projectIds;
    }

    /**
     * @return string
     */
    public function getUserId(): string
    {
        return $this->userId;
    }

    /**
     * @return array
     */
    public function getProjectIds(): array
    {
        return $this->projectIds;
    }
}
