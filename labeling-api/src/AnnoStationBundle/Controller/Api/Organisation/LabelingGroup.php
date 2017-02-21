<?php

namespace AnnoStationBundle\Controller\Api\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.labeling_group")
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
     * LabelingGroup constructor.
     *
     * @param Facade\LabelingGroup  $labelingGroupFacade
     * @param AppFacade\User        $userFacade
     * @param Storage\TokenStorage  $tokenStorage
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade,
        AppFacade\User $userFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService
    ) {
        $this->labelingGroupFacade  = $labelingGroupFacade;
        $this->userFacade           = $userFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->authorizationService = $authorizationService;
    }

    /**
     *
     * @Rest\Get("/{organisation}/labelingGroup/user/coordinators")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getAllCoordinatorsAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (!$user->hasRole(Model\User::ROLE_CLIENT)) {
            throw new Exception\AccessDeniedHttpException();
        }

        $users = [];
        foreach ($this->userFacade->getUserByRole($organisation, Model\User::ROLE_LABEL_COORDINATOR)->toArray(
        ) as $user) {
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

        if (!$user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            throw new Exception\AccessDeniedHttpException();
        }

        $labelingGroups = $this->labelingGroupFacade->findAllByCoordinator($user);
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

        $labelingGroups = $this->labelingGroupFacade->findAll();
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
    public function getGroupAction(AnnoStationBundleModel\Organisation $organisation, Model\LabelingGroup $labelingGroup)
    {
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
     *
     * @CheckPermissions({"canEditLabelingGroups"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function createAction(HttpFoundation\Request $request, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $coordinators = $request->request->get('coordinators', []);
        $labeler      = $request->request->get('labeler', []);
        $name         = $request->request->get('name', null);

        if (count($coordinators) === 0 ||
            count($labeler) === 0 ||
            $name === null || $name === ''
        ) {
            throw new Exception\BadRequestHttpException();
        }

        $labelingGroup = new Model\LabelingGroup($organisation, $coordinators, $labeler, $name);
        $this->labelingGroupFacade->save($labelingGroup);

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
     * @Rest\Put("/{organisation}/labelingGroup/{labelingGroup}")
     *
     * @CheckPermissions({"canEditLabelingGroups"})
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

        $revision = $request->request->get('rev');
        $coordinators = $request->request->get('coordinators', []);
        $labeler      = $request->request->get('labeler', []);
        $name         = $request->request->get('name', null);

        if ($revision !== $labelingGroup->getRev()) {
            throw new Exception\ConflictHttpException('Revision mismatch');
        }

        $labelingGroup->setCoordinators($coordinators);
        $labelingGroup->setLabeler($labeler);
        $labelingGroup->setName($name);
        $this->labelingGroupFacade->save($labelingGroup);

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
     *
     * @CheckPermissions({"canEditLabelingGroups"})
     *
     * @param Model\LabelingGroup                 $labelingGroup
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteAction(Model\LabelingGroup $labelingGroup, AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $this->labelingGroupFacade->delete($labelingGroup);

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
                    $labelingGroup->getCoordinators(),
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
