<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
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
     * @param Facade\Project       $projectFacade
     * @param Facade\LabelingTask  $labelingTaskFacade
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Storage\TokenStorage $tokenStorage
    ) {
        $this->tokenStorage       = $tokenStorage;
        $this->projectFacade      = $projectFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
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
        $user = $this->tokenStorage->getToken()->getUser();

        $assignedGroupId = $request->request->get('assignedGroupId');

        $project->addStatusHistory(
            $user,
            new \DateTime('now', new \DateTimeZone('UTC')),
            Model\Project::STATUS_IN_PROGRESS
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
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            $sumOfTasksByPhaseForProject = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
            foreach($sumOfTasksByPhaseForProject as $phase => $status) {
                // @TODO Remove this if the revision process is finally implemented
                if ($phase === Model\LabelingTask::PHASE_REVISION) {
                    continue;
                }
                if ($status[Model\LabelingTask::STATUS_PREPROCESSING] > 0 ||
                    $status[Model\LabelingTask::STATUS_IN_PROGRESS] > 0 ||
                    $status[Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION] > 0
                ) {
                    throw new Exception\BadRequestHttpException('Project has incomplete tasks');
                }
            }
        }

        $project->addStatusHistory(
            $user,
            new \DateTime('now', new \DateTimeZone('UTC')),
            Model\Project::STATUS_DONE
        );
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => true]);
    }
}
