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
     * @param Facade\LabelingTask         $labelingTaskFacade
     * @param Facade\User                 $userFacade
     * @param Storage\TokenStorageInterface $tokenStorage
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\User $userFacade,
        Storage\TokenStorageInterface $tokenStorage
    ) {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->userFacade         = $userFacade;
        $this->tokenStorage       = $tokenStorage;
    }

    /**
     * @Rest\Get("/{task}/timer/{user}")
     */
    public function getTimerAction(Model\LabelingTask $task, Model\User $user)
    {
        if ($user !== $this->tokenStorage->getToken()->getUser()) {
            throw new Exception\AccessDeniedHttpException();
        }

        $timer = $this->labelingTaskFacade->getTimerForTaskAndUser($task, $user);

        return View\View::create()->setData([
            'result' => [
                'time' => $timer === null ? 0 : $timer->getTimeInSeconds(),
            ],
        ]);
    }

    /**
     * @Rest\Put("/{task}/timer/{user}")
     * @ForbidReadonlyTasks
     */
    public function putTimerAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task,
        Model\User $user
    ) {
        if ($user !== $this->tokenStorage->getToken()->getUser()) {
            throw new Exception\AccessDeniedHttpException();
        }

        if (($timeInSeconds = $request->request->get('time')) === null) {
            throw new Exception\BadRequestHttpException();
        }

        if (!is_int($timeInSeconds)) {
            throw new Exception\BadRequestHttpException();
        }

        if (($timer = $this->labelingTaskFacade->getTimerForTaskAndUser($task, $user)) === null) {
            $timer = new Model\TaskTimer($task, $user);
        }

        $timer->setTimeInSeconds($timeInSeconds);
        $this->labelingTaskFacade->saveTimer($timer);

        return View\View::create()->setData([
            'result' => [
                'time' => $timer->getTimeInSeconds(),
            ],
        ]);
    }
}
