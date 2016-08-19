<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
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
     * @param Facade\Project       $projectFacade
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(Facade\Project $projectFacade, Storage\TokenStorage $tokenStorage)
    {
        $this->tokenStorage  = $tokenStorage;
        $this->projectFacade = $projectFacade;
    }

    /**
     * Set the Project to status inProgress and assign the current user to this project
     *
     * @Rest\POST("/{project}/status/accept")
     *
     * @param HttpFoundation\Request $request
     * @param Model\Project          $project
     * @return \FOS\RestBundle\View\View
     */
    public function setProjectStatusToInProgressAction(HttpFoundation\Request $request, Model\Project $project)
    {
        $user = $this->tokenStorage->getToken()->getUser();

        $assignedGroupId = $request->request->get('assignedGroupId');

        $project->setStatus(Model\Project::STATUS_IN_PROGRESS);
        $project->addCoordinatorAssignmentHistory($user);
        $project->setLabelingGroupId($assignedGroupId);
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => true]);
    }

    /**
     * Set the Project to status done
     *
     * @Rest\POST("/{project}/status/done")
     *
     * @param $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function setProjectStatusToDoneAction(Model\Project $project)
    {
        $project->setStatus(Model\Project::STATUS_DONE);
        $this->projectFacade->save($project);

        return View\View::create()->setData(['result' => true]);
    }
}
