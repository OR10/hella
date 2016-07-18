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
     * @var array|null
     */
    private $sumOfTasksByProjectsAndStatusCache = null;

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

        foreach ($this->projectFacade->getTimePerProject() as $mapping) {
            $projectTimeMapping[$mapping['key']] = $mapping['value'];
        }

        foreach ($projects->toArray() as $project) {
            $timeInSeconds     = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $result[$project->getStatus()][] = array(
                'id'                         => $project->getId(),
                'name'                       => $project->getName(),
                'status'                     => $project->getStatus(),
                'taskCount'                  => $this->getSumOfTasksForProject($project),
                'taskFinishedCount'          => $this->getSumOfCompletedTasksForProject($project),
                'taskInProgressCount'        => $this->getSumOfInProgressTasksForProject($project),
                'totalLabelingTimeInSeconds' => $timeInSeconds,
                'creationTimestamp'          => $project->getCreationDate(),
            );
        }

        foreach(array_keys($result) as $status) {
            usort($result[$status], function ($a, $b) {
                if ($a['creationTimestamp'] === null || $b['creationTimestamp'] === null) {
                    return -1;
                }
                if ($a['creationTimestamp'] === $b['creationTimestamp']) {
                    return 0;
                }
                return ($a['creationTimestamp'] > $b['creationTimestamp']) ? -1 : 1;
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
     * @param Model\Project $project
     * @return int|mixed
     */
    private function getSumOfTasksForProject(Model\Project $project)
    {
        $this->loadDataOfTasksByProjectsAndStatusToCache($project);

        return array_sum($this->sumOfTasksByProjectsAndStatusCache[$project->getId()]);
    }

    /**
     * @param Model\Project $project
     * @return int|mixed
     */
    private function getSumOfCompletedTasksForProject(Model\Project $project)
    {
        $this->loadDataOfTasksByProjectsAndStatusToCache($project);

        return $this->sumOfTasksByProjectsAndStatusCache[$project->getId()][Model\LabelingTask::STATUS_LABELED];
    }

    /**
     * @param Model\Project $project
     * @return int|mixed
     */
    private function getSumOfInProgressTasksForProject(Model\Project $project)
    {
        $this->loadDataOfTasksByProjectsAndStatusToCache($project);

        return $this->sumOfTasksByProjectsAndStatusCache[$project->getId()][Model\LabelingTask::STATUS_WAITING];
    }

    private function loadDataOfTasksByProjectsAndStatusToCache(Model\Project $project)
    {
        if (!isset($this->sumOfTasksByProjectsAndStatusCache[$project->getId()])) {
            $this->sumOfTasksByProjectsAndStatusCache[$project->getId()] = [
                Model\LabelingTask::STATUS_PREPROCESSING => 0,
                Model\LabelingTask::STATUS_WAITING => 0,
                Model\LabelingTask::STATUS_LABELED => 0,
            ];
            foreach ($this->labelingTaskFacade->getSumOfTasksByProject($project)->toArray() as $mapping) {
                $this->sumOfTasksByProjectsAndStatusCache[$mapping['key'][0]][$mapping['key'][1]] = $mapping['value'];
            }
        }
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
