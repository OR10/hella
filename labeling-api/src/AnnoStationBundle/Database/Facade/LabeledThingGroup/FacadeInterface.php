<?php
namespace AnnoStationBundle\Database\Facade\LabeledThingGroup;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param $projectId
     * @param $taskId
     *
     * @return Facade\LabeledThingGroup
     */
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    /**
     * @return Facade\LabeledThingGroup
     */
    public function getReadOnlyFacade();
}