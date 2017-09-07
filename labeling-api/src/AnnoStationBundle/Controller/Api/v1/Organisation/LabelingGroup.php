<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation;

use AnnoStationBundle\Worker\Jobs\DeleteProjectAssignmentsForUserJobCreator;
use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Service\Authentication;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.labeling_group")
 *
 * @CloseSession
 */
class LabelingGroup extends Controller\Base
{
    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Service\UserRolesRebuilder
     */
    private $userRolesRebuilderService;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissionService;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * LabelingGroup constructor.
     *
     * @param Facade\LabelingGroup           $labelingGroupFacade
     * @param Facade\Project                 $projectFacade
     * @param AppFacade\User                 $userFacade
     * @param Storage\TokenStorage           $tokenStorage
     * @param Service\UserRolesRebuilder     $userRolesRebuilderService
     * @param Service\Authorization          $authorizationService
     * @param Authentication\UserPermissions $userPermissionService
     * @param AMQP\FacadeAMQP                $amqpFacade
     */
    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\Project $projectFacade,
        AppFacade\User $userFacade,
        Storage\TokenStorage $tokenStorage,
        Service\UserRolesRebuilder $userRolesRebuilderService,
        Service\Authorization $authorizationService,
        Authentication\UserPermissions $userPermissionService,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->labelingGroupFacade       = $labelingGroupFacade;
        $this->userFacade                = $userFacade;
        $this->tokenStorage              = $tokenStorage;
        $this->authorizationService      = $authorizationService;
        $this->userRolesRebuilderService = $userRolesRebuilderService;
        $this->amqpFacade                = $amqpFacade;
        $this->projectFacade             = $projectFacade;
        $this->userPermissionService     = $userPermissionService;
    }

    /**
     *
     * @Rest\Get("/{organisation}/labelingGroup/user/labelManagers")
     * @Annotations\CheckPermissions({"canListAllLabelManagers"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getAllLabelManagersAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $users = [];
        foreach ($this->userFacade->getUsersByOrganisationAndRole($organisation, Model\User::ROLE_LABEL_MANAGER)
                     ->toArray() as $user) {
            $users[] = [
                'id'   => $user->getId(),
                'name' => $user->getUsername(),
            ];
        }

        return View\View::create()->setData(
            [
                'result' => $users
            ]
        );
    }

    /**
     *
     * @Rest\Get("/{organisation}/labelingGroup/user/groups")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function myOwnGroupsAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (!$user->hasOneRoleOf(
            [Model\User::ROLE_LABEL_MANAGER, Model\User::ROLE_SUPER_ADMIN]
        )
        ) {
            throw new Exception\AccessDeniedHttpException();
        }

        if ($this->userPermissionService->hasPermission('canAssignAllGroupsToProjects')) {
            $labelingGroups = $this->labelingGroupFacade->findAllByOrganisation($organisation);
        } else {
            $labelingGroups = $this->labelingGroupFacade->findAllByOrganisationAndLabelManager($organisation, $user);
        }
        $users = [];
        foreach ($this->getUserListForLabelingGroup($labelingGroups->toArray()) as $user) {
            $users[$user->getId()] = $user;
        }

        $users = new Response\SimpleUsers($users);

        return View\View::create()->setData(
            [
                'totalRows' => $labelingGroups->getTotalRows(),
                'result' => [
                    'labelingGroups' => $labelingGroups->toArray(),
                    'users' => $users->getResult(),
                ]
            ]
        );
    }

    /**
     *
     * @Rest\Get("/{organisation}/labelingGroup")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $labelingGroups = $this->labelingGroupFacade->findAllByOrganisation($organisation);
        $users = [];
        foreach ($this->getUserListForLabelingGroup($labelingGroups->toArray()) as $user) {
            $users[$user->getId()] = $user;
        }

        $users = new Response\SimpleUsers($users);

        return View\View::create()->setData(
            [
                'totalRows' => $labelingGroups->getTotalRows(),
                'result' => [
                    'labelingGroups' => $labelingGroups->toArray(),
                    'users' => $users->getResult(),
                    ]
            ]
        );
    }

    /**
     *
     * @Rest\Get("/{organisation}/labelingGroup/{labelingGroup}")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\LabelingGroup                 $labelingGroup
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getGroupAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\LabelingGroup $labelingGroup
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $users = [];
        foreach ($this->getUserListForLabelingGroup([$labelingGroup]) as $user) {
            $users[$user->getId()] = $user;
        }

        $users = new Response\SimpleUsers($users);

        return View\View::create()->setData(
            [
                'result' => [
                    'labelingGroups' => $labelingGroup,
                    'users' => $users->getResult(),
                    ]
            ]
        );
    }

    /**
     *
     * @Rest\Post("/{organisation}/labelingGroup")
     * @Annotations\CheckPermissions({"canEditLabelingGroups"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function createAction(HttpFoundation\Request $request, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $labelManagers = $request->request->get('labelManagers', []);
        $labeler       = $request->request->get('labeler', []);
        $name          = $request->request->get('name', null);

        if (count($labelManagers) === 0 ||
            count($labeler) === 0 ||
            $name === null || $name === ''
        ) {
            throw new Exception\BadRequestHttpException();
        }

        $labelingGroup = new Model\LabelingGroup($organisation, $labelManagers, $labeler, $name);
        $this->labelingGroupFacade->save($labelingGroup);

        $users = [];
        foreach ($this->getUserListForLabelingGroup([$labelingGroup]) as $user) {
            $this->userRolesRebuilderService->rebuildForUser($user);
            $users[$user->getId()] = $user;
        }

        $users = new Response\SimpleUsers($users);

        return View\View::create()->setData(
            [
                'result' => [
                    'labelingGroups' => $labelingGroup,
                    'users' => $users->getResult(),
                ]
            ]
        );
    }

    /**
     *
     * @Rest\Put("/{organisation}/labelingGroup/{labelingGroup}")
     * @Annotations\CheckPermissions({"canEditLabelingGroups"})
     *
     * @param HttpFoundation\Request              $request
     * @param Model\LabelingGroup                 $labelingGroup
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function updateAction(
        HttpFoundation\Request $request,
        Model\LabelingGroup $labelingGroup,
        AnnoStationBundleModel\Organisation $organisation
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        if ($labelingGroup->getOrganisationId() !==  $organisation->getId()) {
            throw new Exception\BadRequestHttpException('This LabelingGroup is not assigned to this Organisation');
        }

        $revision      = $request->request->get('rev');
        $labelManagers = $request->request->get('labelManagers', []);
        $labeler       = $request->request->get('labeler', []);
        $name          = $request->request->get('name', null);

        if ($revision !== $labelingGroup->getRev()) {
            throw new Exception\ConflictHttpException('Revision mismatch');
        }

        $oldUserIds = array_unique(array_merge($labelingGroup->getLabeler(), $labelingGroup->getLabelManagers()));

        $labelingGroup->setLabelManagers($labelManagers);
        $labelingGroup->setLabeler($labeler);
        $labelingGroup->setName($name);
        $this->labelingGroupFacade->save($labelingGroup);

        $projectIds = array_map(
            function (Model\Project $project) {
                return $project->getId();
            },
            $this->projectFacade->getProjectsForLabelGroup($labelingGroup)
        );

        $deletedUsersIds = array_diff($oldUserIds, array_unique(array_merge($labeler, $labelManagers)));
        $newUsersIds     = array_diff(array_unique(array_merge($labeler, $labelManagers)), $oldUserIds);

        foreach ($deletedUsersIds as $deletedUsersId) {
            $user = $this->userFacade->getUserById($deletedUsersId);
            $this->userRolesRebuilderService->rebuildForUser($user);
            $job = new DeleteProjectAssignmentsForUserJobCreator($user->getId(), $projectIds);
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        foreach ($newUsersIds as $newUsersId) {
            $user = $this->userFacade->getUserById($newUsersId);
            $this->userRolesRebuilderService->rebuildForUser($user);
        }

        $users = [];
        foreach ($this->getUserListForLabelingGroup([$labelingGroup]) as $user) {
            $users[$user->getId()] = $user;
        }

        $users = new Response\SimpleUsers($users);

        return View\View::create()->setData(
            [
                'result' => [
                    'labelingGroups' => $labelingGroup,
                    'users' => $users->getResult(),
                ]
            ]
        );
    }

    /**
     *
     * @Rest\Delete("/{organisation}/labelingGroup/{labelingGroup}")
     * @Annotations\CheckPermissions({"canEditLabelingGroups"})
     *
     * @param Model\LabelingGroup                 $labelingGroup
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function deleteAction(Model\LabelingGroup $labelingGroup, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        if ($labelingGroup->getOrganisationId() !==  $organisation->getId()) {
            throw new Exception\BadRequestHttpException('This LabelingGroup is not assigned to this Organisation');
        }

        $users      = $this->getUserListForLabelingGroup([$labelingGroup]);
        $projects   = $this->projectFacade->getProjectsForLabelGroup($labelingGroup);

        $inProgressProjects = array_filter(
            $projects,
            function (Model\Project $project) {
                return $project->getStatus() === Model\Project::STATUS_IN_PROGRESS;
            }
        );

        if (count($inProgressProjects) > 0) {
            return View\View::create()->setData(
                [
                    'result' => false,
                    'error'  => [
                        'message'  => 'There are at least one ore more projects "in progress" with this labeling-group. Please unassign this group before.',
                        'projectNames' => array_map(function(Model\Project $project) {
                            return $project->getName();
                        }, $projects),
                    ],
                ]
            );
        }

        $projectIds = array_map(function(Model\Project $project) {
            return $project->getId();
        }, $projects);

        $this->labelingGroupFacade->delete($labelingGroup);

        foreach ($projects as $project) {
            $project->setLabelingGroupId(null);
            $this->projectFacade->save($project);
        }

        foreach ($users as $user) {
            $this->userRolesRebuilderService->rebuildForUser($user);
            $job = new DeleteProjectAssignmentsForUserJobCreator($user->getId(), $projectIds);
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return View\View::create()->setData(
            [
                'result' => true,
            ]
        );
    }

    /**
     * @param $labelingGroups
     *
     * @return array
     */
    private function getUserListForLabelingGroup($labelingGroups)
    {
        $labelingUserIds = array_map(function(Model\LabelingGroup $labelingGroup) {
            return array_unique(
                array_merge(
                    $labelingGroup->getLabelManagers(),
                    $labelingGroup->getLabeler()
                )
            );
        }, $labelingGroups);
        $users = [];
        foreach ($labelingUserIds as $labelingUserId) {
            $users = array_merge($users, $labelingUserId);
        }

        return $this->userFacade->getUserByIds(array_unique($users), false);
    }
}
