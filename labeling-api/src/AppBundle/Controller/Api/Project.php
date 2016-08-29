<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
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
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @param Facade\Project             $projectFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Storage\TokenStorage       $tokenStorage
     * @param Facade\User                $userFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage,
        Facade\User $userFacade
    ) {
        $this->projectFacade             = $projectFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->tokenStorage              = $tokenStorage;
        $this->userFacade                = $userFacade;
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
        $user = $this->tokenStorage->getToken()->getUser();

        switch ($status) {
            case Model\Project::STATUS_TODO:
            case Model\Project::STATUS_IN_PROGRESS:
            case Model\Project::STATUS_DONE:
                if ($user->hasRole(Model\User::ROLE_CLIENT) && !$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER])) {
                    $projects = $this->projectFacade->getProjectsForUserAndStatus($user, $status, $limit, $offset);
                    $totalRows = $this->projectFacade->getProjectsForUserAndStatusTotalRows($user, $status);
                }else {
                    $projects = $this->projectFacade->findAllByStatus($status, $limit, $offset);
                    $totalRows = $projects->getTotalRows();
                }
                break;
            default:
                if ($user->hasRole(Model\User::ROLE_CLIENT) && !$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER])) {
                    $projects = $this->projectFacade->getProjectsForUserAndStatus($user, null, $limit, $offset);
                    $totalRows = array_sum(array_values($this->projectFacade->getProjectsForUserAndStatusTotalRows($user)));
                }else {
                    $projects = $this->projectFacade->findAll($limit, $offset);
                    $totalRows = $projects->getTotalRows();
                }
        }

        $result = array(
            Model\Project::STATUS_IN_PROGRESS => array(),
            Model\Project::STATUS_TODO        => array(),
            Model\Project::STATUS_DONE        => array(),
            null                              => array() //@TODO remove this later
        );

        foreach ($this->projectFacade->getTimePerProject() as $mapping) {
            $projectTimeMapping[$mapping['key']] = array_sum($mapping['value']);
        }

        $videosByProjects = $this->labelingTaskFacade->findAllByProjects($projects->toArray());
        $numberOfVideos   = array();
        foreach ($videosByProjects as $videosByProject) {
            $projectId                    = $videosByProject['key'];
            $videoId                      = $videosByProject['value'];
            $numberOfVideos[$projectId][] = $videoId;
        }
        $numberOfVideos = array_map(
            function ($videoByProject) {
                return count(array_unique($videoByProject));
            },
            $numberOfVideos
        );

        foreach ($projects->toArray() as $project) {
            $timeInSeconds = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $sumOfTasksForProject          = $this->getSumOfTasksForProject($project);
            $sumOfCompletedTasksForProject = $this->getSumOfTaskByLabelingStatus($project, Model\LabelingTask::STATUS_DONE);
            $responseProject               = array(
                'id'                 => $project->getId(),
                'name'               => $project->getName(),
                'status'             => $project->getStatus(),
                'finishedPercentage' => round(
                    $sumOfTasksForProject === 0 ? 100 : 100 / $sumOfTasksForProject * $sumOfCompletedTasksForProject
                ),
                'creationTimestamp'        => $project->getCreationDate(),
                'taskInPreProcessingCount' => $this->getSumOfTaskByLabelingStatus($project, Model\LabelingTask::STATUS_PREPROCESSING)
            );

            if ($user->hasOneRoleOf(
                [Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_CLIENT]
            )
            ) {
                $responseProject['taskCount']                  = $this->getSumOfTasksForProject($project);
                $responseProject['taskFinishedCount']          = $sumOfCompletedTasksForProject;
                $responseProject['taskInProgressCount']        = $this->getSumOfTaskByLabelingStatus($project, Model\LabelingTask::STATUS_IN_PROGRESS);
                $responseProject['totalLabelingTimeInSeconds'] = $timeInSeconds;
                $responseProject['labeledThingInFramesCount']  = $this->labeledThingInFrameFacade->getSumOfLabeledThingInFramesByProject($project);
                $responseProject['videosCount']                = isset($numberOfVideos[$project->getId()]) ? $numberOfVideos[$project->getId()] : 0;
                $responseProject['dueTimestamp']               = $project->getDueDate();
            }

            $result[$project->getStatus()][] = $responseProject;
        }

        foreach (array_keys($result) as $status) {
            usort(
                $result[$status],
                function ($a, $b) {
                    if ($a['creationTimestamp'] === null || $b['creationTimestamp'] === null) {
                        return -1;
                    }
                    if ($a['creationTimestamp'] === $b['creationTimestamp']) {
                        return 0;
                    }

                    return ($a['creationTimestamp'] > $b['creationTimestamp']) ? -1 : 1;
                }
            );
        }

        if (!$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_CLIENT])) {
            foreach (array_keys($result) as $status) {
                $result[$status] = array_map(
                    function ($data) {
                        unset($data['creationTimestamp']);

                        return $data;
                    },
                    $result[$status]
                );
            }
        }

        return View\View::create()->setData(
            [
                'totalRows' => $totalRows,
                'result'    => array_merge(
                    $result[Model\Project::STATUS_IN_PROGRESS],
                    $result[Model\Project::STATUS_TODO],
                    $result[Model\Project::STATUS_DONE],
                    $result[null] //@TODO remove this later
                ),
            ]
        );
    }

    /**
     * Create a new Project
     *
     * @Rest\Post("")
     *
     * @CheckPermissions({"canCreateProject"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function addProjectAction(HttpFoundation\Request $request)
    {
        $name             = $request->request->get('name');
        $review           = $request->request->get('review');
        $frameSkip        = $request->request->get('frameSkip');
        $startFrameNumber = $request->request->get('startFrameNumber');
        $splitEach        = $request->request->get('splitEach');
        $projectType      = $request->request->get('projectType');
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $labelingValidationProcesses = [];
        if ($review) {
            $labelingValidationProcesses[] = 'review';
        }

        try {
            $project = Model\Project::create(
                $name,
                $user->getId(),
                null,
                null,
                $labelingValidationProcesses,
                $frameSkip,
                $startFrameNumber,
                $splitEach
            );

            $project->setAvailableExports([$projectType]);
        } catch (\InvalidArgumentException $exception) {
            throw new Exception\BadRequestHttpException($exception->getMessage(), $exception);
        }

        switch ($projectType) {
            case 'legacy':
                if ($request->request->get('vehicle', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_VEHICLE,
                        $request->request->get('drawingToolVehicle', 'rectangle')
                    );
                }
                if ($request->request->get('person', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_PERSON,
                        $request->request->get('drawingToolPerson', 'pedestrian')
                    );
                }
                if ($request->request->get('cyclist', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_CYCLIST,
                        $request->request->get('drawingToolCyclist', 'rectangle')
                    );
                }
                if ($request->request->get('ignore', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_IGNORE,
                        $request->request->get('drawingToolIgnore', 'rectangle')
                    );
                }
                if ($request->request->get('ignore-vehicle', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                        $request->request->get('drawingToolIgnoreVehicle', 'rectangle')
                    );
                }
                if ($request->request->get('lane', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_LANE,
                        $request->request->get('drawingToolLane', 'rectangle')
                    );
                }
                if ($request->request->get('parked-cars', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_PARKED_CARS,
                        $request->request->get('drawingToolParkedCars', 'cuboid')
                    );
                }
                break;
            case 'genericXml':
                $taskTypeConfigurations = $request->request->get('taskTypeConfigurations');

                if (empty($taskTypeConfigurations)) {
                    throw new Exception\BadRequestHttpException('Missing task type configuration');
                }

                foreach ($taskTypeConfigurations as $taskTypeConfiguration) {
                    $project->addGenericXmlTaskInstruction(
                        $taskTypeConfiguration['type'],
                        $taskTypeConfiguration['taskConfigurationId']
                    );
                }
                break;
        }

        $project = $this->projectFacade->save($project);

        return View\View::create()->setData(
            [
                'result' => $project,
            ]
        );
    }

    /**
     * @param Model\Project $project
     *
     * @return int|mixed
     */
    private function getSumOfTasksForProject(Model\Project $project)
    {
        $this->loadDataOfTasksByProjectsAndStatusToCache($project);

        $phases = array(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION,
        );

        $sumOfTasks = 0;
        foreach ($phases as $phase) {
            $sumOfTasks += array_sum($this->sumOfTasksByProjectsAndStatusCache[$project->getId()][$phase]);
        }

        return $sumOfTasks;
    }

    private function getSumOfTaskByLabelingStatus(Model\Project $project, $status)
    {
        $this->loadDataOfTasksByProjectsAndStatusToCache($project);

        $phases = array(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION,
        );

        $sumOfTasks = 0;
        foreach ($phases as $phase) {
            $sumOfTasks += $this->sumOfTasksByProjectsAndStatusCache[$project->getId()][$phase][$status];
        }

        return $sumOfTasks;
    }

    private function loadDataOfTasksByProjectsAndStatusToCache(Model\Project $project)
    {
        if (!isset($this->sumOfTasksByProjectsAndStatusCache[$project->getId()])) {
            $this->sumOfTasksByProjectsAndStatusCache = array_merge(
                $this->sumOfTasksByProjectsAndStatusCache,
                array($project->getId() => $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project))
            );
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
    public function getProjectAction(Model\Project $project)
    {
        return View\View::create()->setData(['result' => $project]);
    }

    /**
     * Assign a label coordinator to a project
     *
     * @Rest\Post("/{project}/assign")
     *
     * @param HttpFoundation\Request $request
     * @param Model\Project          $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function assignProjectToUserAction(HttpFoundation\Request $request, Model\Project $project)
    {
        $assignedLabelCoordinatorId = $request->request->get('assignedLabelCoordinatorId', null);

        $coordinator = $this->userFacade->getUserById($assignedLabelCoordinatorId);
        if (!$coordinator->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            throw new Exception\AccessDeniedHttpException();
        }

        $project->addCoordinatorAssignmentHistory($coordinator);
        $project = $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => $project]);
    }
}
