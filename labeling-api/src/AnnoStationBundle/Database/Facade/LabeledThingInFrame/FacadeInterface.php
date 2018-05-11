<?php
namespace AnnoStationBundle\Database\Facade\LabeledThingInFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     *
     * @return Facade\LabeledThingInFrame
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\LabeledThingInFrame
     */
    public function getReadOnlyFacade();
}
