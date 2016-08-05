<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.status")
 *
 * @CloseSession
 */
class Status extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, Storage\TokenStorage $tokenStorage)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @Rest\Post("/{task}/status/done")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postLabeledStatusAction(Model\LabelingTask $task)
    {
        /** @var Model\User $user */
        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $this->labelingTaskFacade->getCurrentPhase($task);

        $isOneLabeledFrameComplete = false;
        if ($task->getTaskType() === 'meta-labeling') {
            $labeledFrames = $this->labelingTaskFacade->getLabeledFrames($task);
            foreach ($labeledFrames as $labeledFrame) {
                if (!$labeledFrame->getIncomplete()) {
                    $isOneLabeledFrameComplete = true;
                }
            }
            if (!$isOneLabeledFrameComplete) {
                throw new Exception\PreconditionFailedHttpException('No LabeledThing is incomplete');
            }
        }

        if ($task->getTaskType() === 'object-labeling') {
            $labeledThings = $this->labelingTaskFacade->getLabeledThings($task);
            foreach ($labeledThings as $labeledThing) {
                if ($labeledThing->getIncomplete()) {
                    throw new Exception\PreconditionFailedHttpException('One or more LabeledThings are incomplete');
                }
            }
        }


        $task->setStatus($phase, Model\LabelingTask::STATUS_DONE);

        if ($phase === Model\LabelingTask::PHASE_LABELING) {
            $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO);
        }

        $task->addAssignmentHistory(
            $user,
            new \DateTime('now', new \DateTimeZone('UTC')),
            $phase,
            Model\LabelingTask::STATUS_DONE
        );
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Post("/{task}/status/todo")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postWaitingStatusAction(Model\LabelingTask $task)
    {
        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $this->labelingTaskFacade->getCurrentPhase($task);

        if ($user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR])) {
            if ($task->getStatus($phase) !== Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION &&
            $task->getStatus($phase) !== Model\LabelingTask::STATUS_PREPROCESSING) {
                throw new Exception\BadRequestHttpException();
            }
            $task->setStatus($phase, Model\LabelingTask::STATUS_TODO);
            $task->addAssignmentHistory(
                $user,
                new \DateTime('now', new \DateTimeZone('UTC')),
                $phase,
                Model\LabelingTask::STATUS_TODO
            );
            $this->labelingTaskFacade->save($task);

            return View\View::create()->setData(['result' => ['success' => true]]);
        }

        throw new Exception\AccessDeniedHttpException('You are not allowed to change the status');
    }

    /**
     * @Rest\Post("/{task}/status/in_progress")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postInProgressStatusAction(Model\LabelingTask $task)
    {
        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $this->labelingTaskFacade->getCurrentPhase($task);

        if ($user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR])) {
            if ($task->getStatus($phase) !== Model\LabelingTask::STATUS_TODO) {
                throw new Exception\BadRequestHttpException();
            }
            $task->setStatus($phase, Model\LabelingTask::STATUS_IN_PROGRESS);
            $task->addAssignmentHistory(
                $user,
                new \DateTime('now', new \DateTimeZone('UTC')),
                $phase,
                Model\LabelingTask::STATUS_IN_PROGRESS
            );
            $this->labelingTaskFacade->save($task);

            return View\View::create()->setData(['result' => ['success' => true]]);
        }

        throw new Exception\AccessDeniedHttpException('You are not allowed to change the status');
    }

    /**
     * @Rest\Post("/{task}/status/begin")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function beginTaskAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        /** @var Model\User $user */
        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $this->labelingTaskFacade->getCurrentPhase($task);

        if ($task->getStatus($phase) === Model\LabelingTask::STATUS_TODO) {
            $task->setStatus(
                $phase,
                Model\LabelingTask::STATUS_IN_PROGRESS
            );
            $task->addAssignmentHistory(
                $user,
                new \DateTime('now', new \DateTimeZone('UTC')),
                $phase,
                Model\LabelingTask::STATUS_IN_PROGRESS
            );
        }
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Post("/{task}/status/reopen")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     * @return \FOS\RestBundle\View\View
     */
    public function reopenTaskAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();
        $phase = $request->request->get('phase');
        if ($user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR])) {
            $task->setStatus($phase, Model\LabelingTask::STATUS_TODO);
            $task->addAssignmentHistory(
                $user,
                new \DateTime('now', new \DateTimeZone('UTC')),
                $phase,
                Model\LabelingTask::STATUS_TODO
            );
            $task->setReopen($phase, true);
            $task->addAssignmentHistory(
                null,
                new \DateTime('now', new \DateTimeZone('UTC')),
                $phase,
                Model\LabelingTask::STATUS_TODO
            );
            $this->labelingTaskFacade->save($task);

            return View\View::create()->setData(['result' => ['success' => true]]);
        }

        throw new Exception\AccessDeniedHttpException('You are not allowed to change the status');
    }
}