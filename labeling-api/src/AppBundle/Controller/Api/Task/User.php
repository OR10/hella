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
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Storage\TokenStorageInterface $tokenStorage
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, Storage\TokenStorageInterface $tokenStorage)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->tokenStorage = $tokenStorage;
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

        $task->addAssignmentHistory(
            $user,
            new \DateTime('now', new \DateTimeZone('UTC')),
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS
        );

        $this->labelingTaskFacade->save($task);

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
        $phase = $this->labelingTaskFacade->getCurrentPhase($task);

        if ($task->getLatestAssignedUserIdForPhase($phase) !== $user->getId()) {
            throw new Exception\BadRequestHttpException('You are not allowed to delete this task assignment');
        }

        $task->addAssignmentHistory(
            null,
            new \DateTime('now', new \DateTimeZone('UTC')),
            $phase,
            $task->getStatus($phase)
        );

        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @param Model\User $user
     */
    private function isUserAllowedToAssignTo(Model\User $user)
    {
        $currentUser = $this->tokenStorage->getToken()->getUser();
        $assignToOtherUserAllowed = $currentUser->hasOneRoleOf(
            array(Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR)
        );
        if (!$assignToOtherUserAllowed && $currentUser !== $user) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to assign this task');
        }
    }
}
