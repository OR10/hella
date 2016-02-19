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
     * @Rest\Post("/{task}/status/labeled")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postLabeledStatusAction(Model\LabelingTask $task)
    {

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


        $task->setStatus(Model\LabelingTask::STATUS_LABELED);
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Post("/{task}/status/waiting")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postWaitingStatusAction(Model\LabelingTask $task)
    {
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR])) {
            $task->setStatus(Model\LabelingTask::STATUS_WAITING);
            $this->labelingTaskFacade->save($task);

            return View\View::create()->setData(['result' => ['success' => true]]);
        }

        throw new Exception\AccessDeniedHttpException('You are not allowed to change the status');
    }
}