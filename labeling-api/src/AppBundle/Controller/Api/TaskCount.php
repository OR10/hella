<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Service;
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
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * ProjectCount constructor.
     * @param Facade\LabelingTask   $labelingTask
     * @param Service\Authorization $authorizationService
     */
    public function __construct(Facade\LabelingTask $labelingTask, Service\Authorization $authorizationService)
    {
        $this->labelingTask         = $labelingTask;
        $this->authorizationService = $authorizationService;
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
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        $sumTasks = array_merge(
            $this->labelingTask->getSumOfTasksByPhaseForProject($project),
            array(
                Model\LabelingTask::STATUS_ALL_PHASES_DONE => $this->labelingTask->getSumOfAllDoneLabelingTasksForProject(
                    $project
                ),
            )
        );

        return View\View::create()->setData(
            [
                'result' => $sumTasks,
            ]
        );
    }
}
