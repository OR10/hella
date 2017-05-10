<?php

namespace AnnoStationBundle\Database\Facade;

interface Factory
{
    public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    public function getReadOnlyFacade();
}