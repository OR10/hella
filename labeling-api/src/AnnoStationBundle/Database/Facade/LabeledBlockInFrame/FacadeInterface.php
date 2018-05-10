<?php
namespace AnnoStationBundle\Database\Facade\LabeledBlockInFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     * @return mixed
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return mixed
     */
    public function getReadOnlyFacade();
}
