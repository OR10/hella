<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Service;
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
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @param Facade\Project             $projectFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Storage\TokenStorage       $tokenStorage
     * @param Facade\User                $userFacade
     * @param Service\Authorization      $authorizationService
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage,
        Facade\User $userFacade,
        Service\Authorization $authorizationService
    ) {
        $this->projectFacade             = $projectFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->tokenStorage              = $tokenStorage;
        $this->userFacade                = $userFacade;
        $this->authorizationService      = $authorizationService;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $limit  = $request->query->get('limit', null);
        $offset = $request->query->get('offset', null);
        $status = $request->query->get('projectStatus', null);
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $projects  = $this->projectFacade->findAllByUserAndStatus($user, $status)->toArray();
        $totalRows = count($projects);

        usort(
            $projects,
            function (Model\Project $a, Model\Project $b) {
                if ($a->getCreationDate() === null || $b->getCreationDate() === null) {
                    return -1;
                }
                if ($a->getCreationDate() === $b->getCreationDate()) {
                    return 0;
                }

                return ($a->getCreationDate() > $b->getCreationDate()) ? -1 : 1;
            }
        );

        if ($limit !== null && $offset !== null) {
            $projects = array_slice($projects, $offset, $limit);
        }

        $result = array(
            Model\Project::STATUS_IN_PROGRESS => array(),
            Model\Project::STATUS_TODO        => array(),
            Model\Project::STATUS_DONE        => array(),
            null                              => array() //@TODO remove this later
        );

        foreach ($this->projectFacade->getTimePerProject() as $mapping) {
            $projectTimeMapping[$mapping['key'][0]] = array_sum($mapping['value']);
        }

        $videosByProjects = $this->labelingTaskFacade->findAllByProjects($projects);
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

        foreach ($projects as $project) {
            $timeInSeconds = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $sumOfTasksForProject          = $this->getSumOfTasksForProject($project);
            $sumOfCompletedTasksForProject = $this->getSumOfTaskByLabelingStatus($project, Model\LabelingTask::STATUS_DONE);
            $responseProject               = array(
                'id'                 => $project->getId(),
                'name'               => $project->getName(),
                'status'             => $project->getStatus(),
                'finishedPercentage' => floor(
                    $sumOfTasksForProject === 0 ? 0 : 100 / $sumOfTasksForProject * $sumOfCompletedTasksForProject
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

        return new View\View(
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
     * @CheckPermissions({"canCreateProject", "canCreateNewProject"})
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
                $user,
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
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        return View\View::create()->setData(['result' => $project]);
    }

    /**
     * Return the project with the given id
     *
     * @Rest\Delete("/{project}")
     *
     * @param HttpFoundation\Request $request
     * @param Model\Project          $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteProjectAction(HttpFoundation\Request $request, Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (!$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT])) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to deleted this project.');
        }

        $projectStatus = $project->getStatus();
        if ($projectStatus !== Model\Project::STATUS_DONE && $projectStatus !== Model\Project::STATUS_TODO) {
            throw new Exception\NotAcceptableHttpException(
                sprintf(
                    'Its not allowed to delete a project with state "%s"',
                    $projectStatus
                )
            );
        }

        $project->setDeleteFlag(
            $user,
            null,
            $request->query->get('reasonText', '')
        );
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Assign a label coordinator to a project
     *
     * @CheckPermissions({"canAssignProject"})
     *
     * @Rest\Post("/{project}/assign")
     *
     * @param HttpFoundation\Request $request
     * @param Model\Project          $project
     *
     * @return \FOS\RestBundle\View\View
     * @throws \Exception
     */
    public function assignProjectToUserAction(HttpFoundation\Request $request, Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $sumOfPreProcessingTasks = $this->labelingTaskFacade->getSumOfTasksByProjectAndStatus(
            $project,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_PREPROCESSING
        )->toArray();

        if (isset($sumOfPreProcessingTasks[0]['value']) && $sumOfPreProcessingTasks[0]['value'] > 0) {
            throw new Exception\PreconditionFailedHttpException(
                'You can\'t assign this project until all videos are imported'
            );
        }

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
