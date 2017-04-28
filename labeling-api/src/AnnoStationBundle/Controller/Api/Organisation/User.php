<?php

namespace AnnoStationBundle\Controller\Api\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool\AMQP;

/**
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.user")
 *
 * @CloseSession
 */
class User extends Controller\Base
{
    /**
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * Users constructor.
     *
     * @param AppFacade\User                 $userFacade
     * @param Facade\Project                 $projectFacade
     * @param Facade\LabelingGroup           $labelingGroupFacade
     * @param Service\Authorization          $authorizationService
     * @param Authentication\UserPermissions $userPermissions
     * @param AMQP\FacadeAMQP                $amqpFacade
     */
    public function __construct(
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Service\Authorization $authorizationService,
        Authentication\UserPermissions $userPermissions,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->userFacade           = $userFacade;
        $this->authorizationService = $authorizationService;
        $this->userPermissions      = $userPermissions;
        $this->projectFacade        = $projectFacade;
        $this->amqpFacade           = $amqpFacade;
        $this->labelingGroupFacade  = $labelingGroupFacade;
    }

    /**
     * Add a user to an organisation
     *
     * @Rest\Put("/{organisation}/user/{user}/assign")
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return View\View
     */
    public function assignUserToOrganisationAction(AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        if (!$this->userPermissions->hasPermission('canAddUserToOwnOrganisation')) {
            throw new AccessDeniedHttpException();
        }

        $userLimit = $organisation->getUserQuota();

        if ($userLimit !== 0 && $userLimit <= count($this->userFacade->getUserList($organisation))) {
            throw new BadRequestHttpException('You reached your user limit of ' . $userLimit);
        }

        $user->assignToOrganisation($organisation);
        $this->userFacade->updateUser($user);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Remove a user from an organisation
     *
     * @Rest\Delete("/{organisation}/user/{user}/unassign")
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return View\View
     */
    public function unassignUserFromOrganisationAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        if (!$this->userPermissions->hasPermission('canDeleteUserFromOrganisation')) {
            throw new AccessDeniedHttpException();
        }

        $user->removeFromOrganisation($organisation);
        $this->userFacade->updateUser($user);

        $labelingGroups = $this->labelingGroupFacade->findAllByUser($user);

        $labelingGroups = array_filter(
            $labelingGroups,
            function (Model\LabelingGroup $labelingGroup) use ($organisation) {
                return $organisation->getId() === $labelingGroup->getOrganisationId();
            }
        );

        /** @var Model\LabelingGroup $labelingGroup */
        foreach ($labelingGroups as $labelingGroup) {
            $this->labelingGroupFacade->deleteUserFromLabelGroup($labelingGroup, $user);
        }

        $this->removeLabelingTaskAssignments($organisation, $user);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     */
    private function removeLabelingTaskAssignments(AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $projects   = $this->projectFacade->findAllByOrganisation($organisation)->toArray();
        $projectIds = array_map(
            function (Model\Project $project) {
                return $project->getId();
            },
            $projects
        );

        $job = new Jobs\DeleteProjectAssignmentsForUserJobCreator($user->getId(), $projectIds);
        $this->amqpFacade->addJob($job);
    }
}
