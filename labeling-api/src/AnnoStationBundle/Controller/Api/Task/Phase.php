<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.phase")
 *
 * @CloseSession
 */
class Phase extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * Phase constructor.
     *
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @Rest\Put("/{task}/phase")
     *
     * @Security("has_role('ROLE_LABEL_COORDINATOR')")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return View\View
     */
    public function updateTaskPhaseAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        $newPhase      = $request->request->get('phase');
        $currentStatus = $task->getStatus($task->getCurrentPhase());

        if (!$task->isAllPhasesDone()) {
            if ($task->getLatestAssignedUserIdForPhase($task->getCurrentPhase()) !== null) {
                throw new Exception\PreconditionFailedHttpException();
            }

            if (($currentStatus !== Model\LabelingTask::STATUS_TODO && $currentStatus !== Model\LabelingTask::STATUS_DONE)) {
                throw new Exception\PreconditionFailedHttpException();
            }
        }

        switch ($newPhase) {
            case Model\LabelingTask::PHASE_LABELING:
                $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);
                if ($task->hasReviewPhase()) {
                    $task->setStatus(
                        Model\LabelingTask::PHASE_REVIEW,
                        Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION
                    );
                }
                if ($task->hasRevisionPhase()) {
                    $task->setStatus(
                        Model\LabelingTask::PHASE_REVISION,
                        Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION
                    );
                }
                break;
            case Model\LabelingTask::PHASE_REVIEW:
                $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
                $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO);
                if ($task->hasRevisionPhase()) {
                    $task->setStatus(
                        Model\LabelingTask::PHASE_REVISION,
                        Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION
                    );
                }
                break;
            case Model\LabelingTask::PHASE_REVISION:
                $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
                $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_DONE);
                $task->setStatus(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_TODO);
                break;
            case Model\LabelingTask::STATUS_ALL_PHASES_DONE:
                foreach ($task->getRawStatus() as $phase => $status) {
                    $task->setStatus($phase, Model\LabelingTask::STATUS_DONE);
                }
                break;
        }

        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}
