<?php
namespace AnnoStationBundle\Database\Facade\LabeledThing;

use AnnoStationBundle\Database\Facade;

interface FacadeInterface
{
    /**
     * @param string $projectId
     * @param string $taskId
     *
     * @return Facade\LabeledThing
     */
    public function getFacadeByProjectIdAndTaskId(string $projectId, string $taskId);

    /**
     * @return Facade\LabeledThing
     */
    public function getReadOnlyFacade();
}
