<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
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
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @Rest\Post("/{task}/status/{status}")
     *
     * @param Model\LabelingTask $task
     * @param $status
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postStatusAction(Model\LabelingTask $task, $status)
    {
        $task->setStatus($status);
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['success' => true]);
    }
}