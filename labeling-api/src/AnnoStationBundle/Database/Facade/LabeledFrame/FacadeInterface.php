<?php
namespace AnnoStationBundle\Database\Facade\LabeledFrame;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     *
     * @return Facade\LabeledFrame
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\LabeledFrame
     */
    public function getReadOnlyFacade();
}
