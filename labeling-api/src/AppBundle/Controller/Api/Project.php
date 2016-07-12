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
     * @var Facade\Project
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
     * @Rest\Get("/details")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listDetailedAction(HttpFoundation\Request $request)
    {
        $projects           = $this->projectFacade->findAll();
        $projectTimeMapping = [];
        $result             = array();

        foreach ($this->projectFacade->getTimePerProject() as $mapping) {
            $projectTimeMapping[$mapping['key']] = $mapping['value'];
        }

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

            $timeInSeconds = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $result[] = array(
                'id'                         => $project->getId(),
                'name'                       => $project->getName(),
                'taskCount'                  => $taskCount,
                'taskFinishedCount'          => $complete,
                'totalLabelingTimeInSeconds' => $timeInSeconds,
            );
        }

        return View\View::create()->setData(
            [
                'result' => $result,
            ]
        );
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
        $limit  = $request->query->getInt('limit', null);
        $offset = $request->query->getInt('offset', null);

        $projects = $this->projectFacade->findAll($limit, $offset);
        $result   = array();

        foreach ($projects as $project) {
            $result[] = array(
                'id'   => $project->getId(),
                'name' => $project->getName(),
                'creation_timestamp' => $project->getCreationDate(),
                'status' => $project->getStatus(),
            );
        }

        return View\View::create()->setData(
            [
                'result' => $result,
            ]
        );
    }

    /**
     * Return the project with the given id
     *
     * @Rest\Get("/{project}")
     *
     * @param $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getTaskAction(Model\Project $project)
    {
        return View\View::create()->setData(['result' => $project]);
    }
}
