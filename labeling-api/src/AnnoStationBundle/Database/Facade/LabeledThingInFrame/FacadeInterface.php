<?php
namespace AnnoStationBundle\Database\Facade\LabeledThingInFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param $projectId
     * @param $taskId
     *
     * @return Facade\LabeledThingInFrame
     */
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    /**
     * @return Facade\LabeledThingInFrame
     */
    public function getReadOnlyFacade();
}