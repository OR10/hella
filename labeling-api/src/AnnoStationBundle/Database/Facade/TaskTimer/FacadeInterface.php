<?php

namespace AnnoStationBundle\Database\Facade\TaskTimer;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param $projectId
     * @param $taskId
     *
     * @return Facade\LabelingTask
     */
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    /**
     * @return Facade\LabelingTask
     */
    public function getReadOnlyFacade();
}
