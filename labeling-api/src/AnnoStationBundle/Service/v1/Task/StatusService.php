<?php

namespace AnnoStationBundle\Service\v1\Task;

use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Worker\Jobs\DeleteInvalidLtifLtAndLtgReferences;
use crosscan\WorkerPool\AMQP\FacadeAMQP;
use crosscan\WorkerPool\Facade as WorkerPoolFacade;
use Symfony\Component\HttpKernel\Exception\PreconditionFailedHttpException;
use AppBundle\Model\LabelingTask;
use AnnoStationBundle\Database\Facade\LabelingTask as LabelingTaskFacade;

class StatusService
{
    /**
     * @var LabelingTaskFacade
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledThing
     */
    private $labeledThingFacade;

    /**
     * StatusService constructor.
     *
     * @param LabelingTaskFacade $labelingTaskFacade
     * @param LabeledThing       $labeledThingFacade
     * @param FacadeAMQP         $amqpFacade
     */
    public function __construct(
        LabelingTaskFacade $labelingTaskFacade,
        LabeledThing $labeledThingFacade,
        FacadeAMQP $amqpFacade
    )
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->labeledThingFacade = $labeledThingFacade;
        $this->amqpFacade         = $amqpFacade;
    }

    /**
     * update label status
     * @param $user
     * @param $task
     * @param $phase
     */
    public function updateLabeledStatus($user, $task, $phase)
    {
        $isOneLabeledFrameComplete = false;
        if ($task->getTaskType() === 'meta-labeling') {
            $labeledFrames = $this->labelingTaskFacade->getLabeledFrames($task);
            foreach ($labeledFrames as $labeledFrame) {
                if (!$labeledFrame->getIncomplete()) {
                    $isOneLabeledFrameComplete = true;
                }
            }
            if (!$isOneLabeledFrameComplete) {
                throw new PreconditionFailedHttpException('There must be at least one LabeledFrame labeled');
            }
        }

        if ($task->getTaskType() === 'object-labeling') {
            $labeledThings = $this->labeledThingFacade->findByTaskId($task);
            foreach ($labeledThings as $labeledThing) {
                if ($labeledThing->getIncomplete()) {
                    throw new PreconditionFailedHttpException('One or more LabeledThings are incomplete');
                }
            }
        }

        $task->setStatus($phase, LabelingTask::STATUS_DONE);
        $task->addAssignmentHistory($phase, LabelingTask::STATUS_DONE, $user);

        if ($task->hasReviewPhase() && $phase === LabelingTask::PHASE_LABELING) {
            $task->addAssignmentHistory(LabelingTask::PHASE_REVIEW, LabelingTask::STATUS_TODO);
            $task->setStatus(LabelingTask::PHASE_REVIEW, LabelingTask::STATUS_TODO);
        }

        $this->labelingTaskFacade->save($task);

        $job = new DeleteInvalidLtifLtAndLtgReferences($task->getId());
        $this->amqpFacade->addJob($job, WorkerPoolFacade::HIGH_PRIO);
    }
}
