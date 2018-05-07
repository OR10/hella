<?php
namespace AnnoStationBundle\Database\Facade\LabeledBlockInFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param $projectId
     * @param $taskId
     * @return mixed
     */
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    /**
     * @return mixed
     */
    public function getReadOnlyFacade();
}
