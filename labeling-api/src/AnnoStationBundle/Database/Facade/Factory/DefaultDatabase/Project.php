<?php

namespace AnnoStationBundle\Database\Facade\Factory\DefaultDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class Project extends Facade\Factory
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