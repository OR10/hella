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
use Symfony\Component\Security\Core\Authentication\Token\Storage;

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
    private $sumOfTasksByProjectsAndStatusCache = [];

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @param Facade\Project             $projectFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Storage\TokenStorage       $tokenStorage
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage
    ) {
        $this->projectFacade             = $projectFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->tokenStorage              = $tokenStorage;
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
        $status = $request->query->get('projectStatus', null);
        /** @var Model\User $user */
        $user   = $this->tokenStorage->getToken()->getUser();

        switch ($status) {
            case Model\Project::STATUS_TODO:
            case Model\Project::STATUS_IN_PROGRESS:
            case Model\Project::STATUS_DONE:
                $projects = $this->projectFacade->findAllByStatus($status, $limit, $offset);
                break;
            default:
                $projects = $this->projectFacade->findAll($limit, $offset);
        }

        $result   = array(
            Model\Project::STATUS_IN_PROGRESS => array(),
            Model\Project::STATUS_TODO => array(),
            Model\Project::STATUS_DONE => array(),
            null => array() //@TODO remove this later
        );

        foreach ($this->projectFacade->getTimePerProject() as $mapping) {
            $projectTimeMapping[$mapping['key']] = $mapping['value'];
        }

        $videosByProjects = $this->labelingTaskFacade->findAllByProjects($projects->toArray());
        $numberOfVideos = array();
        foreach($videosByProjects as $videosByProject) {
            $projectId = $videosByProject['key'];
            $videoId = $videosByProject['value'];
            $numberOfVideos[$projectId][] = $videoId;
        }
        $numberOfVideos = array_map(
            function($videoByProject) {
                return count(array_unique($videoByProject));
            },
            $numberOfVideos
        );

        foreach ($projects->toArray() as $project) {
            $timeInSeconds     = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $responseProject = array(
                'id' => $project->getId(),
                'name' => $project->getName(),
                'status' => $project->getStatus(),
                'finishedPercentage' => round(
                    $this->getSumOfTasksForProject($project) === 0 ? 100 : 100 / $this->getSumOfTasksForProject($project) * $this->getSumOfCompletedTasksForProject($project)),
                'creationTimestamp' => $project->getCreationDate(),
            );

            if ($user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR])) {
                $responseProject['taskCount']                  = $this->getSumOfTasksForProject($project);
                $responseProject['taskFinishedCount']          = $this->getSumOfCompletedTasksForProject($project);
                $responseProject['taskInProgressCount']        = $this->getSumOfInProgressTasksForProject($project);
                $responseProject['totalLabelingTimeInSeconds'] = $timeInSeconds;
                $responseProject['labeledThingInFramesCount']  = $this->labeledThingInFrameFacade->getSumOfLabeledThingInFramesByProject($project);
                $responseProject['videosCount']                = isset($numberOfVideos[$project->getId()]) ? $numberOfVideos[$project->getId()] : 0;
                $responseProject['dueTimestamp']               = $project->getDueDate();
            }

            $result[$project->getStatus()][] = $responseProject;
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

        if (!$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR])) {
            foreach (array_keys($result) as $status) {
                $result[$status] = array_map(function ($data) {
                    unset($data['creationTimestamp']);
                    return $data;
                }, $result[$status]);
            }
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

        return $this->sumOfTasksByProjectsAndStatusCache[$project->getId()][Model\LabelingTask::STATUS_DONE];
    }

    /**
     * @param Model\Project $project
     * @return int|mixed
     */
    private function getSumOfInProgressTasksForProject(Model\Project $project)
    {
        $this->loadDataOfTasksByProjectsAndStatusToCache($project);

        return $this->sumOfTasksByProjectsAndStatusCache[$project->getId()][Model\LabelingTask::STATUS_TODO];
    }

    private function loadDataOfTasksByProjectsAndStatusToCache(Model\Project $project)
    {
        if (!isset($this->sumOfTasksByProjectsAndStatusCache[$project->getId()])) {
            $this->sumOfTasksByProjectsAndStatusCache = array_merge($this->sumOfTasksByProjectsAndStatusCache, $this->labelingTaskFacade->getSumOfTasksByProject($project));
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
