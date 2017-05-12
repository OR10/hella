<?php

namespace AnnoStationBundle\Database\Facade\Project;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;

class DefaultDatabase extends Factory\Cache implements FacadeInterface
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    public function __construct(Facade\Project $projectFacade)
    {
        $this->projectFacade = $projectFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        return $this->projectFacade;
    }

    public function getReadOnlyFacade()
    {

        return $this->projectFacade;
    }
}