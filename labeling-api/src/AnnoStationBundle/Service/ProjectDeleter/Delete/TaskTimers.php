<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class TaskTimers
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    public function delete(Model\LabelingTask $labelingTask)
    {
        $taskTimers = $this->labelingTaskFacade->getTaskTimerByTask($labelingTask);
        foreach($taskTimers as $taskTimer) {
            $this->labelingTaskFacade->deleteTimer($taskTimer);
        }
    }
}
