<?php

namespace AnnoStationBundle\Controller\Api\v1\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/task")
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
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $databaseSecurityPermissionService;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * @param Facade\LabelingTask                           $labelingTaskFacade
     * @param Storage\TokenStorage                          $tokenStorage
     * @param Facade\Project                                $projectFacade
     * @param Facade\LabeledThing                           $labeledThingFacade
     * @param Service\Authorization                         $authorizationService
     * @param Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
     * @param Authentication\UserPermissions                $userPermissions
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage,
        Facade\Project $projectFacade,
        Facade\LabeledThing $labeledThingFacade,
        Service\Authorization $authorizationService,
        Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->labelingTaskFacade                = $labelingTaskFacade;
        $this->tokenStorage                      = $tokenStorage;
        $this->projectFacade                     = $projectFacade;
        $this->authorizationService              = $authorizationService;
        $this->databaseSecurityPermissionService = $databaseSecurityPermissionService;
        $this->labeledThingFacade                = $labeledThingFacade;
        $this->userPermissions                   = $userPermissions;
    }

    /**
     * @Rest\Post("/{task}/status/done")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postLabeledStatusAction(Model\LabelingTask $task)
    {
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user    = $this->tokenStorage->getToken()->getUser();
        $phase   = $task->getCurrentPhase();

        if (!$this->userPermissions->hasPermission('canFinishTaskOfOtherUsers')
            && $task->getLatestAssignedUserIdForPhase($phase) !== $user->getId()
        ) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to change the status');
        }

        $isOneLabeledFrameComplete = false;
        if ($task->getTaskType() === 'meta-labeling') {
            $labeledFrames = $this->labelingTaskFacade->getLabeledFrames($task);
            foreach ($labeledFrames as $labeledFrame) {
                if (!$labeledFrame->getIncomplete()) {
                    $isOneLabeledFrameComplete = true;
                }
            }
            if (!$isOneLabeledFrameComplete) {
                throw new Exception\PreconditionFailedHttpException('There must be at least one LabeledFrame labeled');
            }
        }

        if ($task->getTaskType() === 'object-labeling') {
            $labeledThings = $this->labeledThingFacade->findByTaskId($task);
            foreach ($labeledThings as $labeledThing) {
                if ($labeledThing->getIncomplete()) {
                    throw new Exception\PreconditionFailedHttpException('One or more LabeledThings are incomplete');
                }
            }
        }

        $task->setStatus($phase, Model\LabelingTask::STATUS_DONE);
        $task->addAssignmentHistory($phase, Model\LabelingTask::STATUS_DONE, $user);

        if ($task->hasReviewPhase() && $phase === Model\LabelingTask::PHASE_LABELING) {
            $task->addAssignmentHistory(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO);
            $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO);
        }

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
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $task->getCurrentPhase();

        if ($this->userPermissions->hasPermission('canMoveTaskInOtherPhase')) {
            if ($task->getStatus($phase) !== Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION &&
                $phase !== Model\LabelingTask::PHASE_PREPROCESSING
            ) {
                throw new Exception\BadRequestHttpException();
            }
            $task->setStatus($phase, Model\LabelingTask::STATUS_TODO);
            $task->addAssignmentHistory($phase, Model\LabelingTask::STATUS_TODO, $user);

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
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $task->getCurrentPhase();

        if ($this->userPermissions->hasPermission('canMoveTaskInOtherPhase')) {
            if ($task->getStatus($phase) !== Model\LabelingTask::STATUS_TODO) {
                throw new Exception\BadRequestHttpException();
            }
            $task->setStatus($phase, Model\LabelingTask::STATUS_IN_PROGRESS);
            $task->addAssignmentHistory($phase, Model\LabelingTask::STATUS_IN_PROGRESS, $user);

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
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $task->getCurrentPhase();

        if ($task->getStatus($phase) === Model\LabelingTask::STATUS_TODO) {
            $task->setStatus(
                $phase,
                Model\LabelingTask::STATUS_IN_PROGRESS
            );
        }
        if ($task->getLatestAssignedUserIdForPhase($phase) === null) {
            $task->addAssignmentHistory($phase, $task->getStatus($phase), $user);
        }
        $this->labelingTaskFacade->save($task);
        $this->databaseSecurityPermissionService->updateForTask($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Post("/{task}/status/reopen")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function reopenTaskAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user  = $this->tokenStorage->getToken()->getUser();
        $phase = $request->request->get('phase');
        if ($this->userPermissions->hasPermission('canReopenTask')) {
            $task->setStatus($phase, Model\LabelingTask::STATUS_TODO);
            $task->addAssignmentHistory($phase, Model\LabelingTask::STATUS_TODO, $user);
            $task->setReopen($phase, true);
            $task->addAssignmentHistory($phase, Model\LabelingTask::STATUS_TODO);
            $this->labelingTaskFacade->save($task);

            return View\View::create()->setData(['result' => ['success' => true]]);
        }

        throw new Exception\AccessDeniedHttpException('You are not allowed to change the status');
    }
}
