<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.timer")
 *
 * @CloseSession
 */
class Timer extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @var Storage\TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @param Facade\LabelingTask           $labelingTaskFacade
     * @param Facade\User                   $userFacade
     * @param Storage\TokenStorageInterface $tokenStorage
     * @param Service\Authorization         $authorizationService
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\User $userFacade,
        Storage\TokenStorageInterface $tokenStorage,
        Service\Authorization $authorizationService
    ) {
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->userFacade           = $userFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->authorizationService = $authorizationService;
    }

    /**
     * @Rest\Get("/{task}/timer/{user}")
     * @param Model\LabelingTask $task
     * @param Model\User         $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getTimerAction(Model\LabelingTask $task, Model\User $user)
    {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        if ($user !== $this->tokenStorage->getToken()->getUser()) {
            throw new Exception\AccessDeniedHttpException('Its not allowed to set the timer for other users');
        }

        $timer = $this->labelingTaskFacade->getTimerForTaskAndUser($task, $user);

        return View\View::create()->setData([
            'result' => [
                'time' => $timer === null ? 0 : $timer->getTimeInSeconds($task->getCurrentPhase()),
            ],
        ]);
    }

    /**
     * @Rest\Put("/{task}/timer/{user}")
     * @ForbidReadonlyTasks
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     * @param Model\User             $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function putTimerAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task,
        Model\User $user
    ) {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        if ($user !== $this->tokenStorage->getToken()->getUser()) {
            throw new Exception\AccessDeniedHttpException('Its not allowed to set the timer for other users');
        }

        if (($timeInSeconds = $request->request->get('time')) === null) {
            throw new Exception\BadRequestHttpException('Missing time');
        }

        if (!is_int($timeInSeconds)) {
            throw new Exception\BadRequestHttpException('Time must be an integer');
        }

        if (($timer = $this->labelingTaskFacade->getTimerForTaskAndUser($task, $user)) === null) {
            $timer = new Model\TaskTimer($task, $user);
        }
        $phase = $task->getCurrentPhase();

        $timer->setTimeInSeconds($phase, $timeInSeconds);
        $this->labelingTaskFacade->saveTimer($timer);

        return View\View::create()->setData([
            'result' => [
                'time' => $timer->getTimeInSeconds($phase),
            ],
        ]);
    }
}
