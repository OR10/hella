<?php
namespace AnnoStationBundle\Database\Facade\Project;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     *
     * @return Facade\Project
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\Project
     */
    public function getReadOnlyFacade();
}
