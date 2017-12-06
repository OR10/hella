<?php

namespace AnnoStationBundle\Controller\Api\v1\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AnnoStationBundle\Service\Authentication;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.user")
 *
 * @CloseSession
 */
class User extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Storage\TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $taskDatabaseSecurityPermissionService;

    /**
     * @param Facade\LabelingTask                           $labelingTaskFacade
     * @param Storage\TokenStorageInterface                 $tokenStorage
     * @param Authentication\UserPermissions                $userPermissions
     * @param Service\TaskDatabaseSecurityPermissionService $taskDatabaseSecurityPermissionService
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorageInterface $tokenStorage,
        Authentication\UserPermissions $userPermissions,
        Service\TaskDatabaseSecurityPermissionService $taskDatabaseSecurityPermissionService
    ) {
        $this->labelingTaskFacade                    = $labelingTaskFacade;
        $this->tokenStorage                          = $tokenStorage;
        $this->userPermissions                       = $userPermissions;
        $this->taskDatabaseSecurityPermissionService = $taskDatabaseSecurityPermissionService;
    }

    /**
     * @Rest\Put("/{task}/user/{user}/assign")
     * @param Model\LabelingTask $task
     * @param Model\User $user
     * @return \FOS\RestBundle\View\View
     */
    public function assignLabelingTaskToUserAction(Model\LabelingTask $task, Model\User $user)
    {
        $this->isUserAllowedToAssignTo($user);

        $task->addAssignmentHistory(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS, $user);

        $this->labelingTaskFacade->save($task);

        $this->taskDatabaseSecurityPermissionService->updateForTask($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Delete("/{task}/user/{user}/assign")
     * @param Model\LabelingTask $task
     * @param Model\User $user
     * @return \FOS\RestBundle\View\View
     */
    public function deleteAssignedLabelingTaskAction(Model\LabelingTask $task, Model\User $user)
    {
        $this->isUserAllowedToAssignTo($user);
        $phase = $task->getCurrentPhase();
        $lastUserAssignmentId = $task->getLatestAssignedUserIdForPhase($phase);

        if ($lastUserAssignmentId !== $user->getId()) {
            throw new Exception\BadRequestHttpException(
                sprintf(
                    'Failed to unassign user! This task "%s" in phase "%s" is currently assign to "%s" and you are trying to remove user "%s".',
                    $task->getId(),
                    $phase,
                    $lastUserAssignmentId,
                    $user->getId()
                )
            );
        }

        $task->addAssignmentHistory($phase, $task->getStatus($phase));

        $this->labelingTaskFacade->save($task);

        $this->taskDatabaseSecurityPermissionService->updateForTask($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @param Model\User $user
     */
    private function isUserAllowedToAssignTo(Model\User $user)
    {
        $currentUser = $this->tokenStorage->getToken()->getUser();

        if (!$this->userPermissions->hasPermission('canChangeUserTaskAssignment') && $currentUser !== $user) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to assign this task to someone else than yourself.');
        }
    }
}
