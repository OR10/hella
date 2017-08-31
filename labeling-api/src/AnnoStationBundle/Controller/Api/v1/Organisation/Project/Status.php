<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AnnoStationBundle\Service\Authentication;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project.status")
 *
 * @CloseSession
 */
class Status extends Controller\Base
{
    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * @var Service\TaskDatabaseSecurityPermissionService
     */
    private $databaseSecurityPermissionService;

    /**
     * @param Facade\Project                                $projectFacade
     * @param Facade\LabelingTask                           $labelingTaskFacade
     * @param Storage\TokenStorage                          $tokenStorage
     * @param Service\Authorization                         $authorizationService
     * @param Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
     * @param Authentication\UserPermissions                $userPermissions
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService,
        Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->tokenStorage                      = $tokenStorage;
        $this->projectFacade                     = $projectFacade;
        $this->labelingTaskFacade                = $labelingTaskFacade;
        $this->authorizationService              = $authorizationService;
        $this->userPermissions                   = $userPermissions;
        $this->databaseSecurityPermissionService = $databaseSecurityPermissionService;
    }

    /**
     * Set the Project to status inProgress and assign the current user to this project
     *
     * @Rest\POST("/{organisation}/project/{project}/status/accept")
     *
     * @CheckPermissions({"canAcceptProject"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function setProjectStatusToInProgressAction(
        HttpFoundation\Request $request,
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $user = $this->tokenStorage->getToken()->getUser();

        $sumOfTaskByPhase = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
        if ($sumOfTaskByPhase[Model\LabelingTask::PHASE_PREPROCESSING][Model\LabelingTask::STATUS_TODO] > 0) {
            throw new Exception\PreconditionFailedHttpException(
                'Videos are already in pre-processing and not ready for labeling.'
            );
        }

        $assignedGroupId = $request->request->get('assignedGroupId');

        $project->addStatusHistory(
            new \DateTime('now', new \DateTimeZone('UTC')),
            Model\Project::STATUS_IN_PROGRESS,
            $user
        );
        $project->addLabelManagerAssignmentHistory($user);
        $project->setLabelingGroupId($assignedGroupId);
        $this->projectFacade->save($project);

        $this->databaseSecurityPermissionService->updateForProject($project);

        return View\View::create()->setData(['result' => true]);
    }

    /**
     * Set the Project to status done
     *
     * @Rest\POST("/{organisation}/project/{project}/status/done")
     * @CheckPermissions({"canMoveInProgressProjectToDone"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function setProjectStatusToDoneAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if ($this->userPermissions->hasPermission('canMoveProjectToDone')) {
            $sumOfTasksByPhaseForProject = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
            foreach ($sumOfTasksByPhaseForProject as $phase => $status) {
                // @TODO Remove this if the revision process is finally implemented
                if ($phase === Model\LabelingTask::PHASE_REVISION) {
                    continue;
                }
                if ($status[Model\LabelingTask::STATUS_TODO] > 0 ||
                    $status[Model\LabelingTask::STATUS_IN_PROGRESS] > 0 ||
                    $status[Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION] > 0
                ) {
                    throw new Exception\BadRequestHttpException('Project has incomplete tasks');
                }
            }
        }

        $project->addStatusHistory(
            new \DateTime('now', new \DateTimeZone('UTC')),
            Model\Project::STATUS_DONE,
            $user
        );
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => true]);
    }

    /**
     * @Rest\Post("/{organisation}/project/{project}/status/deleted")
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return View\View
     */
    public function setProjectStatusToDeletedAction(
        HttpFoundation\Request $request,
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (!$this->userPermissions->hasPermission('canDeleteProject')) {
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

        $project->setDeletedReason($request->get('message'));
        $project->addStatusHistory(
            new \DateTime('now', new \DateTimeZone('UTC')),
            Model\Project::STATUS_DELETED,
            $user
        );
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}
