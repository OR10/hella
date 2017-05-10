<?php

namespace AnnoStationBundle\Database\Facade;

interface Factory
{
    public function getProjectAndTaskFacade($projectId, $taskId);

    public function getReadOnlyFacade();
}