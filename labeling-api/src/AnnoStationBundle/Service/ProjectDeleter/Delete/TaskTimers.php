<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\LabelingTask;

class TaskTimers
{
    /**
     * @var LabelingTask\FacadeInterface
     */
    private $labelingTaskFacadeFactory;

    public function __construct(LabelingTask\FacadeInterface $labelingTaskFacadeFactory)
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
