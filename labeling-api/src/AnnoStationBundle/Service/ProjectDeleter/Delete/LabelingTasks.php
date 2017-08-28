<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;

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
     * @var LabeledThingGroup
     */
    private $labeledThingGroup;

    /**
     * @var Video
     */
    private $videoDeleter;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledFrames $labeledFramesDeleter,
        LabeledThings $labeledThingsDeleter,
        LabeledThingInFrames $labeledThingInFrameDeleter,
        TaskTimers $taskTimerDeleter,
        LabeledThingGroup $labeledThingGroup,
        Video $videoDeleter,
        AMQP\FacadeAMQP $amqpFacade,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService
    ) {
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledFramesDeleter           = $labeledFramesDeleter;
        $this->labeledThingsDeleter           = $labeledThingsDeleter;
        $this->labeledThingInFrameDeleter     = $labeledThingInFrameDeleter;
        $this->taskTimerDeleter               = $taskTimerDeleter;
        $this->labeledThingGroup              = $labeledThingGroup;
        $this->videoDeleter                   = $videoDeleter;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->amqpFacade                     = $amqpFacade;
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\Project $project)
    {
        $tasks = $this->labelingTaskFacade->findAllByProject($project, true);
        foreach ($tasks as $task) {
            $this->labeledThingGroup->delete($task);
            $this->labeledFramesDeleter->delete($task);
            $this->labeledThingsDeleter->delete($task);
            $this->labeledThingInFrameDeleter->delete($task);
            $this->taskTimerDeleter->delete($task);
            $this->videoDeleter->delete($task);
            $this->labelingTaskFacade->delete($task);

            $database = $this->taskDatabaseCreatorService->getDatabaseName(
                $task->getProjectId(),
                $task->getId()
            );

            $job = new Jobs\DatabaseDeleter($database);
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }
    }
}
