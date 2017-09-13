<?php
namespace AnnoStationBundle\Database\Facade\LabeledThingGroupInFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param $projectId
     * @param $taskId
     *
     * @return Facade\LabeledThingGroupInFrame
     */
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    /**
     * @return Facade\LabeledThingGroupInFrame
     */
    public function getReadOnlyFacade();
}
