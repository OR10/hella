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
 * @Rest\Prefix("/api/project")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project")
 *
 * @CloseSession
 */
class Project extends Controller\Base
{
    /**
     * @var Facade\Video
     */
    private $projectFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @param Facade\Project             $projectFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(Facade\Project $projectFacade, Facade\LabeledThingInFrame $labeledThingInFrameFacade)
    {
        $this->projectFacade             = $projectFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $projects = $this->projectFacade->findAll();
        $result   = array();

        foreach ($projects as $project) {
            $tasks     = $this->projectFacade->getTasksByProject($project);
            $taskCount = count($tasks);

            $tasks = array_filter(
                $tasks,
                function (Model\LabelingTask $task) {
                    return $task->getStatus() === Model\LabelingTask::STATUS_LABELED;
                }
            );

            $complete = 0;
            foreach ($tasks as $task) {
                if (count($this->labeledThingInFrameFacade->getIncompleteLabeledThingsInFrame($task)) === 0) {
                    $complete++;
                }
            }

            $result[] = array(
                'id'                => $project->getId(),
                'name'              => $project->getName(),
                'taskCount'         => $taskCount,
                'taskFinishedCount' => $complete,
            );
        }

        return View\View::create()->setData(
            [
                'result' => $result,
            ]
        );
    }
}
