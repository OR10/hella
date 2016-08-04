<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/taskCount")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task_count")
 *
 * @CloseSession
 */
class TaskCount extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTask;

    /**
     * ProjectCount constructor.
     * @param Facade\LabelingTask $labelingTask
     */
    public function __construct(Facade\LabelingTask $labelingTask)
    {
        $this->labelingTask = $labelingTask;
    }

    /**
     * @Rest\Get("/{project}")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getTaskCountAction(HttpFoundation\Request $request, Model\Project $project)
    {
        $sumLabeling = $this->labelingTask->getSumOfTasksByPhaseForProject($project);

        return View\View::create()->setData(
            [
                'result' => $sumLabeling,
            ]
        );
    }
}