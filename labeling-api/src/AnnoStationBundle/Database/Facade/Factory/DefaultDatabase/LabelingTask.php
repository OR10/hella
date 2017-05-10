<?php

namespace AnnoStationBundle\Database\Facade\Factory\DefaultDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabelingTask extends Facade\Factory
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        return $this->labelingTaskFacade;
    }

    public function getReadOnlyFacade()
    {
        return $this->labelingTaskFacade;
    }

    public function getFacade()
    {
        return $this->labelingTaskFacade;
    }
}