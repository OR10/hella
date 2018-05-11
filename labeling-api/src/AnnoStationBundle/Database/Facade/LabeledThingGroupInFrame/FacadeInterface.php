<?php
namespace AnnoStationBundle\Database\Facade\LabeledThingGroupInFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     *
     * @return Facade\LabeledThingGroupInFrame
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\LabeledThingGroupInFrame
     */
    public function getReadOnlyFacade();
}
