<?php

namespace AnnoStationBundle\Controller\Api\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AnnoStationBundle\Response;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;

/**
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project")
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
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @param Facade\Project             $projectFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Storage\TokenStorage       $tokenStorage
     * @param AppFacade\User             $userFacade
     * @param Service\Authorization      $authorizationService
     * @param AMQP\FacadeAMQP            $amqpFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage,
        AppFacade\User $userFacade,
        Service\Authorization $authorizationService,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->projectFacade             = $projectFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->tokenStorage              = $tokenStorage;
        $this->userFacade                = $userFacade;
        $this->authorizationService      = $authorizationService;
        $this->amqpFacade                = $amqpFacade;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("/{organisation}/project")
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $limit  = $request->query->get('limit', null);
        $offset = $request->query->get('offset', null);
        $status = $request->query->get('projectStatus', null);
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $projects  = $this->projectFacade->findAllByUserAndStatus($organisation, $user, $status)->toArray();
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
            Model\Project::STATUS_DELETED     => array(),
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

        $users = [];

        /** @var Model\Project $project */
        foreach ($projects as $project) {
            $timeInSeconds = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $sumOfTasksForProject          = $this->getSumOfTasksForProject($project);
            $sumOfCompletedTasksForProject = $this->labelingTaskFacade->getSumOfAllDoneLabelingTasksForProject(
                $project
            );
            $sumOfTasksByPhaseForProject   = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);

            $sumOfFailedTasks        = 0;
            $sumOfPreProcessingTasks = 0;
            foreach ($sumOfTasksByPhaseForProject as $phase => $states) {
                $sumOfFailedTasks += $states[Model\LabelingTask::STATUS_FAILED];
                if ($phase === Model\LabelingTask::PHASE_PREPROCESSING) {
                    $sumOfPreProcessingTasks += $states[Model\LabelingTask::STATUS_TODO];
                }
            }

            $responseProject               = array(
                'id'                 => $project->getId(),
                'name'               => $project->getName(),
                'status'             => $project->getStatus(),
                'finishedPercentage' => floor(
                    $sumOfTasksForProject === 0 ? 0 : 100 / $sumOfTasksForProject * $sumOfCompletedTasksForProject
                ),
                'creationTimestamp'        => $project->getCreationDate(),
                'taskInPreProcessingCount' => $sumOfPreProcessingTasks,
            );

            if ($user->hasOneRoleOf(
                [
                    Model\User::ROLE_ADMIN,
                    Model\User::ROLE_LABEL_COORDINATOR,
                    Model\User::ROLE_CLIENT,
                    Model\User::ROLE_OBSERVER,
                ]
            )
            ) {
                $taskInProgressCount = 0;
                $taskFailedCount     = 0;

                foreach ($sumOfTasksByPhaseForProject as $phase => $states) {
                    $taskInProgressCount += $states[Model\LabelingTask::STATUS_IN_PROGRESS];
                    $taskFailedCount += $states[Model\LabelingTask::STATUS_FAILED];
                }

                $responseProject['taskCount']                  = $sumOfTasksForProject;
                $responseProject['taskFinishedCount']          = $sumOfCompletedTasksForProject;
                $responseProject['taskInProgressCount']        = $taskInProgressCount;
                $responseProject['taskFailedCount']            = $taskFailedCount;
                $responseProject['totalLabelingTimeInSeconds'] = $timeInSeconds;
                $responseProject['labeledThingInFramesCount']  = $this->labeledThingInFrameFacade->getSumOfLabeledThingInFramesByProject(
                    $project
                );
                $responseProject['videosCount']                = isset(
                    $numberOfVideos[$project->getId()]
                ) ? $numberOfVideos[$project->getId()] : 0;
                $responseProject['dueTimestamp']               = $project->getDueDate();
                if (!empty($project->getGenericXmlTaskInstructions())) {
                    $responseProject['taskInstructionType'] = 'genericXml';
                }elseif (!empty($project->getRequirementsXmlTaskInstructions())) {
                    $responseProject['taskInstructionType'] = 'requirementsXml';
                }else{
                    $responseProject['taskInstructionType'] = 'legacy';
                }
            }

            if ($user->hasRole(Model\User::ROLE_ADMIN)) {
                $responseProject['deletedState'] = $project->getDeletedState();
            }

            if ($user->hasRole(Model\User::ROLE_CLIENT)) {
                $responseProject['coordinator'] = $project->getLatestAssignedCoordinatorUserId();
                if ($project->getLatestAssignedCoordinatorUserId() !== null) {
                    $users[] = $this->userFacade->getUserById($project->getLatestAssignedCoordinatorUserId());
                }
            }

            $result[$project->getStatus()][] = $responseProject;
        }

        $roleNeededForCreationTime = [
            Model\User::ROLE_ADMIN,
            Model\User::ROLE_LABEL_COORDINATOR,
            Model\User::ROLE_CLIENT
        ];
        if (!$user->hasOneRoleOf($roleNeededForCreationTime)) {
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

        $users = new Response\SimpleUsers($users);

        return new View\View(
            [
                'totalRows' => $totalRows,
                'result'    => array_merge(
                    $result[Model\Project::STATUS_IN_PROGRESS],
                    $result[Model\Project::STATUS_TODO],
                    $result[Model\Project::STATUS_DONE],
                    $result[Model\Project::STATUS_DELETED],
                    $result[null] //@TODO remove this later
                ),
                'users' => $users->getResult(),
            ]
        );
    }

    /**
     * Create a new Project
     *
     * @Rest\Post("/{organisation}/project")
     *
     * @CheckPermissions({"canCreateProject", "canCreateNewProject"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function addProjectAction(HttpFoundation\Request $request, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $name             = $request->request->get('name');
        $review           = $request->request->get('review');
        $frameSkip        = $request->request->get('frameSkip');
        $startFrameNumber = $request->request->get('startFrameNumber');
        $splitEach        = $request->request->get('splitEach');
        $description      = $request->request->get('description');
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
                $organisation,
                $user,
                null,
                null,
                $labelingValidationProcesses,
                $frameSkip,
                $startFrameNumber,
                $splitEach,
                $description
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
            case 'requirementsXml':
                $taskTypeConfigurations = $request->request->get('taskTypeConfigurations');

                if (empty($taskTypeConfigurations)) {
                    throw new Exception\BadRequestHttpException('Missing task type configuration');
                }

                if (count($taskTypeConfigurations) > 1) {
                    throw new Exception\BadRequestHttpException(
                        'Only a single requirementsXML is allowed for a project.'
                    );
                }

                foreach ($taskTypeConfigurations as $taskTypeConfiguration) {
                    $project->addRequirementsXmlTaskInstruction(
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
        $tasks = $this->labelingTaskFacade->findAllByProject($project);

        return count($tasks);
    }

    /**
     * Return the project with the given id
     *
     * @Rest\Get("/{organisation}/project/{project}")
     *
     * @param Model\Project                       $project
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function getProjectAction(Model\Project $project, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        return View\View::create()->setData(['result' => $project]);
    }

    /**
     * Return the project with the given id
     *
     * @Rest\Post("/{organisation}/project/{project}/delete")
     *
     * @param HttpFoundation\Request              $request
     * @param Model\Project                       $project
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function deleteProjectAction(
        HttpFoundation\Request $request,
        Model\Project $project,
        AnnoStationBundleModel\Organisation $organisation
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (!$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT])) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to deleted this project.');
        }

        $projectStatus = $project->getStatus();
        if ($projectStatus !== Model\Project::STATUS_DELETED) {
            throw new Exception\NotAcceptableHttpException(
                sprintf(
                    'Its not allowed to delete a project with state "%s"',
                    $projectStatus
                )
            );
        }
        $project->setDeletedState(Model\Project::DELETED_PENDING);

        $this->projectFacade->save($project);

        $job = new Jobs\ProjectDeleter($project->getId());
        $this->amqpFacade->addJob($job);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Assign a label coordinator to a project
     *
     * @CheckPermissions({"canAssignProject"})
     *
     * @Rest\Post("/{organisation}/project/{project}/assign")
     *
     * @param HttpFoundation\Request              $request
     * @param Model\Project                       $project
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function assignProjectToUserAction(
        HttpFoundation\Request $request,
        Model\Project $project,
        AnnoStationBundleModel\Organisation $organisation
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $sumOfPreProcessingTasks = $this->labelingTaskFacade->getSumOfTasksByProjectAndStatus(
            $project,
            Model\LabelingTask::PHASE_PREPROCESSING,
            Model\LabelingTask::STATUS_TODO
        );

        if ($sumOfPreProcessingTasks > 0) {
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
