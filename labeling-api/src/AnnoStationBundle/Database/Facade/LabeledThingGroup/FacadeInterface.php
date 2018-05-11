<?php
namespace AnnoStationBundle\Database\Facade\LabeledThingGroup;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     *
     * @return Facade\LabeledThingGroup
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\LabeledThingGroup
     */
    public function getReadOnlyFacade();
}
