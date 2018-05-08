<?php

namespace AnnoStationBundle\Database\Facade\TaskTimer;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     * @return Facade\LabelingTask
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\LabelingTask
     */
    public function getReadOnlyFacade();
}
