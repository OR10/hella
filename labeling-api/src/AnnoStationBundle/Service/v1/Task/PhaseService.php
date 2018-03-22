<?php

namespace AnnoStationBundle\Service\v1\Task;

use AppBundle\Model\LabelingTask;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\PreconditionFailedHttpException;
use AnnoStationBundle\Database\Facade\LabelingTask as LabelingTaskFacade;

class PhaseService
{
    /**
     * @var LabelingTaskFacade
     */
    private $labelingTaskFacade;

    /**
     * PhaseService constructor.
     *
     * @param LabelingTaskFacade $labelingTaskFacade
     */
    public function __construct(
        LabelingTaskFacade $labelingTaskFacade
    )
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * update labeling task phase/status
     * @param Request $request
     * @param LabelingTask $task
     */
    public function updateTaskPhase(Request $request, LabelingTask $task)
    {
        $newPhase      = $request->request->get('phase');
        $currentStatus = $task->getStatus($task->getCurrentPhase());

        if (!$task->isAllPhasesDone()) {
            if ($task->getLatestAssignedUserIdForPhase($task->getCurrentPhase()) !== null) {
                throw new PreconditionFailedHttpException();
            }

            if ($currentStatus !== LabelingTask::STATUS_TODO &&
                $currentStatus !== LabelingTask::STATUS_DONE
            ) {
                throw new PreconditionFailedHttpException();
            }
        }

        switch ($newPhase) {
            case LabelingTask::PHASE_LABELING:
                $task->setStatus(LabelingTask::PHASE_LABELING, LabelingTask::STATUS_TODO);
                $task->addAssignmentHistory(LabelingTask::PHASE_LABELING, LabelingTask::STATUS_TODO);
                if ($task->hasReviewPhase()) {
                    $task->setStatus(
                        LabelingTask::PHASE_REVIEW,
                        LabelingTask::STATUS_WAITING_FOR_PRECONDITION
                    );
                }
                if ($task->hasRevisionPhase()) {
                    $task->setStatus(
                        LabelingTask::PHASE_REVISION,
                        LabelingTask::STATUS_DONE
                    );
                }
                break;
            case LabelingTask::PHASE_REVIEW:
                if (!$task->hasReviewPhase()) {
                    throw new BadRequestHttpException();
                }
                $task->setStatus(LabelingTask::PHASE_LABELING, LabelingTask::STATUS_DONE);
                $task->setStatus(LabelingTask::PHASE_REVIEW, LabelingTask::STATUS_TODO);
                $task->addAssignmentHistory(LabelingTask::PHASE_REVIEW, LabelingTask::STATUS_TODO);
                if ($task->hasRevisionPhase()) {
                    $task->setStatus(
                        LabelingTask::PHASE_REVISION,
                        LabelingTask::STATUS_DONE
                    );
                }
                break;
            case LabelingTask::PHASE_REVISION:
                $task->setStatus(LabelingTask::PHASE_LABELING, LabelingTask::STATUS_DONE);
                if ($task->hasReviewPhase()) {
                    $task->setStatus(LabelingTask::PHASE_REVIEW, LabelingTask::STATUS_DONE);
                }
                $task->setStatus(LabelingTask::PHASE_REVISION, LabelingTask::STATUS_TODO);
                $task->addAssignmentHistory(LabelingTask::PHASE_REVISION, LabelingTask::STATUS_TODO);
                break;
            case LabelingTask::STATUS_ALL_PHASES_DONE:
                foreach ($task->getRawStatus() as $phase => $status) {
                    $task->setStatus($phase, LabelingTask::STATUS_DONE);
                }
                break;
        }

        $this->labelingTaskFacade->save($task);
    }
}
