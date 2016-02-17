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
     * @Rest\Put("/{task}/user/{user}/assignToTask")
     * @param Model\LabelingTask $task
     * @param Model\User $user
     * @return \FOS\RestBundle\View\View
     */
    public function assignLabelingTaskToUserAction(Model\LabelingTask $task, Model\User $user)
    {
        /** @var Model\User $currentUser */
        $currentUser = $this->tokenStorage->getToken()->getUser();
        $assignToOtherUserAllowed = $currentUser->hasOneRoleOf(
            array(Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR)
        );
        if (!$assignToOtherUserAllowed && $currentUser !== $user) {
            throw new Exception\AccessDeniedHttpException();
        }
        $task->setAssignedUser($user);
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}