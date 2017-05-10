<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\Factory;

class TaskTimers
{
    /**
     * @var Factory
     */
    private $labelingTaskFacadeFactory;

    public function __construct(Factory $labelingTaskFacadeFactory)
    {
        $this->labelingTaskFacadeFactory = $labelingTaskFacadeFactory;
    }

    public function delete(Model\LabelingTask $labelingTask)
    {
        $labelingTaskFacade = $this->labelingTaskFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        $taskTimers = $labelingTaskFacade->getTaskTimerByTask($labelingTask);
        foreach ($taskTimers as $taskTimer) {
            $labelingTaskFacade->deleteTimer($taskTimer);
        }
    }
}
