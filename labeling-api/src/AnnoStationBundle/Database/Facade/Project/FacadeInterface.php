<?php
namespace AnnoStationBundle\Database\Facade\Project;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param $projectId
     * @param $taskId
     *
     * @return Facade\Project
     */
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    /**
     * @return Facade\Project
     */
    public function getReadOnlyFacade();
}