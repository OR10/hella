<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
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
     * @var AppFacade\User
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
     * @param AppFacade\User                $userFacade
     * @param Storage\TokenStorageInterface $tokenStorage
     * @param Service\Authorization         $authorizationService
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        AppFacade\User $userFacade,
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
     * @return View\View
     */
    public function getTimerForUserAction(Model\LabelingTask $task, Model\User $user)
    {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        if ($user !== $this->tokenStorage->getToken()->getUser()) {
            throw new Exception\AccessDeniedHttpException('Its not allowed to get the timer for other users');
        }

        $phase = $task->getCurrentPhase();

        $timer = $this->labelingTaskFacade->getTimerForTaskAndUser($task, $user);

        $overallTimer = $this->labelingTaskFacade->getTimeInSecondsForTask($task);

        return View\View::create()->setData(
            [
                'result' => [
                    'time'    => $timer === null ? 0 : $timer->getTimeInSeconds($phase),
                    'overall' => !isset($overallTimer[$phase]) ? 0 : $overallTimer[$phase],
                ],
            ]
        );
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
