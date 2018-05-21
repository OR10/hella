<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation;

use AnnoStationBundle\Helper\Iterator\LabeledThingInFrame;
use AnnoStationBundle\Helper\Iterator\TaskTimeByTask;
use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Project as ProjectFacadeFactory;
use AnnoStationBundle\Database\Facade\LabelingTask as LabelingTaskFacadeFactory;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame as LabeledThingInFrameFacadeFactory;
use AppBundle\Database\Facade as AppFacade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AnnoStationBundle\Response;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;
use AnnoStationBundle\Service\Authentication;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
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
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Facade\Campaign
     */
    private $campaignFacade;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $taskDatabaseSecurityPermissionService;

    /**
     * @var LabelingTaskFacadeFactory\FacadeInterface
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var LabeledThingInFrameFacadeFactory\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var Facade\Project
     */
    private $projectFacadeReadOnly;

    /**
     * @var Service\v1\Project\ProjectCreator
     */
    private $projectCreator;

    /**
     * @var Facade\TaskTimer\FacadeInterface
     */
    private $labeledTimeFacadeFactory;

    /**
     * @var Facade\LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingFrameFacadeFactory;

    /**
     * @var Service\v1\Project\ProjectService
     */
    private $projectService;

    /**
     * Project constructor.
     *
     * @param ProjectFacadeFactory                          $projectFacade
     * @param LabelingTaskFacadeFactory                     $labelingTaskFacade
     * @param Facade\Organisation                           $organisationFacade
     * @param Facade\Campaign                               $campaignFacade
     * @param Facade\TaskConfiguration                      $taskConfigurationFacade
     * @param Facade\Project\FacadeInterface                $projectFacadeFactory
     * @param Facade\LabelingTask\FacadeInterface           $labelingTaskFacadeFactory
     * @param Facade\LabeledThingInFrame\FacadeInterface    $labeledThingInFrameFacadeFactory
     * @param Storage\TokenStorage                          $tokenStorage
     * @param AppFacade\User                                $userFacade
     * @param Service\Authorization                         $authorizationService
     * @param Service\TaskDatabaseSecurityPermissionService $taskDatabaseSecurityPermissionService
     * @param AMQP\FacadeAMQP                               $amqpFacade
     * @param Authentication\UserPermissions                $userPermissions
     * @param Service\v1\Project\ProjectCreator             $projectCreator
     * @param Facade\TaskTimer\FacadeInterface              $labeledTimeFacadeFactory
     * @param Facade\LabeledThingInFrame\FacadeInterface    $labeledThingFrameFacadeFactory
     * @param Service\v1\Project\ProjectService             $projectService
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Organisation $organisationFacade,
        Facade\Campaign $campaignFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        ProjectFacadeFactory\FacadeInterface $projectFacadeFactory,
        LabelingTaskFacadeFactory\FacadeInterface $labelingTaskFacadeFactory,
        LabeledThingInFrameFacadeFactory\FacadeInterface $labeledThingInFrameFacadeFactory,
        Storage\TokenStorage $tokenStorage,
        AppFacade\User $userFacade,
        Service\Authorization $authorizationService,
        Service\TaskDatabaseSecurityPermissionService $taskDatabaseSecurityPermissionService,
        AMQP\FacadeAMQP $amqpFacade,
        Authentication\UserPermissions $userPermissions,
        Service\v1\Project\ProjectCreator $projectCreator,
        Facade\TaskTimer\FacadeInterface $labeledTimeFacadeFactory,
        Facade\LabeledThingInFrame\FacadeInterface $labeledThingFrameFacadeFactory,
        Service\v1\Project\ProjectService $projectService
    ) {
        $this->projectFacade                         = $projectFacade;
        $this->labelingTaskFacade                    = $labelingTaskFacade;
        $this->tokenStorage                          = $tokenStorage;
        $this->userFacade                            = $userFacade;
        $this->taskConfigurationFacade               = $taskConfigurationFacade;
        $this->authorizationService                  = $authorizationService;
        $this->amqpFacade                            = $amqpFacade;
        $this->organisationFacade                    = $organisationFacade;
        $this->campaignFacade                        = $campaignFacade;
        $this->userPermissions                       = $userPermissions;
        $this->taskDatabaseSecurityPermissionService = $taskDatabaseSecurityPermissionService;
        $this->projectFacadeReadOnly                 = $projectFacadeFactory->getReadOnlyFacade();
        $this->labelingTaskFacadeFactory             = $labelingTaskFacadeFactory;
        $this->labeledThingInFrameFacadeFactory      = $labeledThingInFrameFacadeFactory;
        $this->projectCreator                        = $projectCreator;
        $this->labeledTimeFacadeFactory              = $labeledTimeFacadeFactory;
        $this->labeledThingFrameFacadeFactory        = $labeledThingFrameFacadeFactory;
        $this->projectService                        = $projectService;
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
        $labelingTaskFacade = $this->labelingTaskFacadeFactory->getReadOnlyFacade();

        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $limit  = $request->query->get('limit', null);
        $offset = $request->query->get('offset', null);
        $status = $request->query->get('projectStatus', null);

        if (!$this->isUserAllowedToAccessThisStatus($status)) {
            throw new Exception\AccessDeniedHttpException(sprintf('You are not allowed to request the status "%s".', $status));
        }

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

        $projectList = $this->projectService->projectList($projects, $labelingTaskFacade ,$organisation);

        if (!$this->userPermissions->hasPermission('canViewProjectsCreationTimestamp')) {
            foreach (array_keys($projectList['result']) as $status) {
                $projectList['result'][$status] = array_map(
                    function ($data) {
                        unset($data['creationTimestamp']);

                        return $data;
                    },
                    $projectList['result'][$status]
                );
            }
        }

        $users = new Response\SimpleUsers($projectList['users']);
        $allUsers = array();
        foreach($this->userFacade->getUserByIds(array_unique($projectList['usersIds'])) as $user) {
            $allUsers[$user->getId()] = array(
                'id'                => $user->getId(),
                'email'             => $user->getEmail(),
                'enabled'           => $user->isEnabled(),
                'expired'           => !$user->isAccountNonExpired(),
                'expiresAt'         => $user->getExpiresAt(),
                'lastLogin'         => $user->getLastLogin(),
                'locked'            => !$user->isAccountNonLocked(),
                'organisations'     => $user->getOrganisations(),
                'password'          => null, // for compability
                'roles'             => $user->getRoles(),
                'username'          => $user->getUsername()
            );
        }

        return new View\View(
            [
                'totalRows' => $totalRows,
                'result'    => array_merge(
                    $projectList['result'][Model\Project::STATUS_IN_PROGRESS],
                    $projectList['result'][Model\Project::STATUS_TODO],
                    $projectList['result'][Model\Project::STATUS_DONE],
                    $projectList['result'][Model\Project::STATUS_DELETED],
                    $projectList['result'][null] //@TODO remove this later
                ),
                'users' => $users->getResult(),
                'allUsers' => $allUsers
            ]
        );
    }

    /**
     * Check if the user is allowed to request this status
     * The in_progress status is currently always allowed
     *
     * @param $status
     * @return bool
     */
    private function isUserAllowedToAccessThisStatus($status)
    {
        switch ($status) {
            case Model\Project::STATUS_IN_PROGRESS:
                return true;
            case Model\Project::STATUS_TODO:
                return $this->userPermissions->hasPermission('canViewTodoProjects');
            case Model\Project::STATUS_DONE:
                return $this->userPermissions->hasPermission('canViewClosedProjects');
            case Model\Project::STATUS_DELETED:
                return $this->userPermissions->hasPermission('canViewDeletedProjects');
        }

        return false;
    }

    /**
     * Create a new Project
     *
     * @Rest\Post("/{organisation}/project")
     * @Annotations\CheckPermissions({"canCreateProject"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function addProjectAction(HttpFoundation\Request $request, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $project = $this->projectCreator->createNewProject($organisation, $user, $request);

        $project = $this->projectFacade->save($project);

        return View\View::create()->setData(
            [
                'result' => $project,
            ]
        );
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
     * @Annotations\CheckPermissions({"canDeleteProject"})
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
        $this->amqpFacade->addJob($job, WorkerPool\Facade::HIGH_PRIO);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Assign a Label Manager to a project
     * @Annotations\CheckPermissions({"canAssignProject"})
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

        $assignedLabelManagerId = $request->request->get('assignedLabelManagerId', null);

        $labelManager = $this->userFacade->getUserById($assignedLabelManagerId);
        if (!$labelManager->hasRole(Model\User::ROLE_LABEL_MANAGER)) {
            throw new Exception\AccessDeniedHttpException('You need label manager permissions');
        }

        $project->addLabelManagerAssignmentHistory($labelManager);
        $project = $this->projectFacade->save($project);

        $this->taskDatabaseSecurityPermissionService->updateForProject($project);

        return View\View::create()->setData(['result' => $project]);
    }

    /**
     * Change the label-group project assignment
     * @Annotations\CheckPermissions({"canChangeProjectLabelGroupAssignment"})
     *
     * @Rest\Post("/{organisation}/project/{project}/assignLabelGroup")
     *
     * @param HttpFoundation\Request              $request
     * @param Model\Project                       $project
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function changeLabelGroupAssignmentAction(
        HttpFoundation\Request $request,
        Model\Project $project,
        AnnoStationBundleModel\Organisation $organisation
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $labelGroupId = $request->request->get('labelGroupId', null);
        $project->setLabelingGroupId($labelGroupId);

        $this->projectFacade->save($project);

        $tasks = $this->labelingTaskFacade->findAllByProject($project, true);

        foreach ($tasks as $task) {
            $userId = $task->getLatestAssignedUserIdForPhase($task->getCurrentPhase());
            if ($userId !== null) {
                $job = new Jobs\LabelingTaskRemoveAssignment(
                    $userId, $task->getId()
                );
                $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
            }
        }

        return View\View::create()->setData(['result' => $project]);
    }
}
