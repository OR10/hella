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
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\Project             $projectFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabelingTask $labelingTaskFacade
    ) {
        $this->projectFacade             = $projectFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
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
        $offset             = $request->query->get('offset');
        $limit              = $request->query->get('limit');

        $projects                      = $this->projectFacade->findAll($limit, $offset);
        $projectTimeMapping            = [];
        $sumOfTasksByProjects          = [];
        $sumOfCompletedTasksByProjects = [];
        $result                        = array();

        foreach ($this->projectFacade->getTimePerProject() as $mapping) {
            $projectTimeMapping[$mapping['key']] = $mapping['value'];
        }

        foreach ($this->labelingTaskFacade->getSumOfTasksByProjects() as $mapping) {
            $sumOfTasksByProjects[$mapping['key']] = $mapping['value'];
        }

        foreach ($this->labelingTaskFacade->getSumOfCompletedTasksByProjects() as $mapping) {
            $sumOfCompletedTasksByProjects[$mapping['key']] = $mapping['value'];
        }

        foreach ($projects->toArray() as $project) {
            $timeInSeconds     = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;
            $taskCount         = isset($sumOfTasksByProjects[$project->getId()]) ? $sumOfTasksByProjects[$project->getId()] : 0;
            $taskFinishedCount = isset($sumOfCompletedTasksByProjects[$project->getId()]) ? $sumOfCompletedTasksByProjects[$project->getId()] : 0;

            $result[] = array(
                'id'                         => $project->getId(),
                'name'                       => $project->getName(),
                'taskCount'                  => $taskCount,
                'taskFinishedCount'          => $taskFinishedCount,
                'totalLabelingTimeInSeconds' => $timeInSeconds,
            );
        }

        return View\View::create()->setData(
            [
                'totalRows' => $projects->getTotalRows(),
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
        $limit  = $request->query->get('limit', null);
        $offset = $request->query->get('offset', null);

        $projects = $this->projectFacade->findAll($limit, $offset);
        $result   = array(
            Model\Project::STATUS_IN_PROGRESS => array(),
            Model\Project::STATUS_TODO => array(),
            Model\Project::STATUS_DONE => array(),
            null => array() //@TODO remove this later
        );

        foreach ($projects->toArray() as $project) {
            $tasks     = $this->projectFacade->getTasksByProject($project);

            $tasksComplete = array_filter(
                $tasks,
                function (Model\LabelingTask $task) {
                    return $task->getStatus() === Model\LabelingTask::STATUS_LABELED;
                }
            );

            $result[$project->getStatus()][] = array(
                'id'   => $project->getId(),
                'name' => $project->getName(),
                'creation_timestamp' => $project->getCreationDate(),
                'status' => $project->getStatus(),
                'taskCount' => count($tasks),
                'taskFinishedCount' => count($tasksComplete),
            );
        }

        foreach(array_keys($result) as $status) {
            usort($result[$status], function ($a, $b) {
                if ($a['creation_timestamp'] === null || $b['creation_timestamp'] === null) {
                    return -1;
                }
                if ($a['creation_timestamp'] === $b['creation_timestamp']) {
                    return 0;
                }
                return ($a['creation_timestamp'] > $b['creation_timestamp']) ? -1 : 1;
            });
        }

        return View\View::create()->setData(
            [
                'totalRows' => $projects->getTotalRows(),
                'result' => array_merge(
                    $result[Model\Project::STATUS_IN_PROGRESS],
                    $result[Model\Project::STATUS_TODO],
                    $result[Model\Project::STATUS_DONE],
                    $result[null] //@TODO remove this later
                    ),
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
