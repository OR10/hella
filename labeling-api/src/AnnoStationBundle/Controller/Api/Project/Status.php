<?php

namespace AnnoStationBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/project")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project.status")
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
     * @param Facade\Project        $projectFacade
     * @param Facade\LabelingTask   $labelingTaskFacade
     * @param Storage\TokenStorage  $tokenStorage
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService
    ) {
        $this->tokenStorage         = $tokenStorage;
        $this->projectFacade        = $projectFacade;
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->authorizationService = $authorizationService;
    }

    /**
     * Set the Project to status inProgress and assign the current user to this project
     *
     * @Rest\POST("/{project}/status/accept")
     *
     * @CheckPermissions({"canAcceptProject"})
     *
     * @param HttpFoundation\Request $request
     * @param Model\Project          $project
     * @return \FOS\RestBundle\View\View
     */
    public function setProjectStatusToInProgressAction(HttpFoundation\Request $request, Model\Project $project)
    {
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
        $project->addCoordinatorAssignmentHistory($user);
        $project->setLabelingGroupId($assignedGroupId);
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => true]);
    }

    /**
     * Set the Project to status done
     *
     * @Rest\POST("/{project}/status/done")
     * @CheckPermissions({"canMoveFinishedProjectToDone", "canMoveInProgressProjectToDone"})
     *
     * @param $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function setProjectStatusToDoneAction(Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
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
}
