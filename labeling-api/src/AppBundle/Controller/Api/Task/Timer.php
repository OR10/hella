<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;


/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.timer")
 */
class Timer extends Controller\Base
{
    /**
     * @Rest\Get("/{taskId}/timer/{userId}")
     */
    public function getTimerAction()
    {
        return View\View::create()->setData([
            'result' => [
                'time' => 23,
            ],
        ]);
    }

    /**
     * @Rest\Put("/{taskId}/timer/{userId}")
     */
    public function putTimerAction(HttpFoundation\Request $request)
    {
        $time = (int) $request->request->get('time', 0);

        return View\View::create()->setData([
            'result' => [
                'time' => $time,
            ],
        ]);
    }
}
