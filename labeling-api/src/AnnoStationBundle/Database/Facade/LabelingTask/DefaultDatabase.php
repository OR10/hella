<?php

namespace AnnoStationBundle\Database\Facade\LabelingTask;

use AnnoStationBundle\Database\Facade;

class DefaultDatabase implements FacadeInterface
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
}