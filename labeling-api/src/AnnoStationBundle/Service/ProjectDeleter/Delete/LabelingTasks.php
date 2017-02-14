<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class LabelingTasks
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledFrames
     */
    private $labeledFramesDeleter;

    /**
     * @var LabeledThings
     */
    private $labeledThingsDeleter;

    /**
     * @var LabeledThingInFrames
     */
    private $labeledThingInFrameDeleter;

    /**
     * @var TaskTimers
     */
    private $taskTimerDeleter;

    /**
     * @var Video
     */
    private $videoDeleter;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledFrames $labeledFramesDeleter,
        LabeledThings $labeledThingsDeleter,
        LabeledThingInFrames $labeledThingInFrameDeleter,
        TaskTimers $taskTimerDeleter,
        Video $videoDeleter

    ) {
        $this->labelingTaskFacade         = $labelingTaskFacade;
        $this->labeledFramesDeleter       = $labeledFramesDeleter;
        $this->labeledThingsDeleter       = $labeledThingsDeleter;
        $this->labeledThingInFrameDeleter = $labeledThingInFrameDeleter;
        $this->taskTimerDeleter           = $taskTimerDeleter;
        $this->videoDeleter               = $videoDeleter;
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\Project $project)
    {
        $tasks = $this->labelingTaskFacade->findAllByProject($project, true);
        foreach ($tasks as $task) {
            $this->labeledFramesDeleter->delete($task);
            $this->labeledThingsDeleter->delete($task);
            $this->labeledThingInFrameDeleter->delete($task);
            $this->taskTimerDeleter->delete($task);
            $this->videoDeleter->delete($task);
            $this->labelingTaskFacade->delete($task);
        }
    }
}
