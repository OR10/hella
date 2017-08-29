<?php

namespace AnnoStationBundle\Controller\Api\v1;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Worker\Jobs;
use AnnoStationBundle\Annotations\CheckPermissions;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\Service\Validation\ValidationError;
use AppBundle\View;
use AppBundle\Service\Validation\Model\VerifyUserPassword;
use AppBundle\Service\Validation;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\RedirectView;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/user")
 * @Rest\Route(service="annostation.labeling_api.controller.api.users")
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
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Validation\ValidationService
     */
    private $validationService;

    /**
     * @var Service\UserRolesRebuilder
     */
    private $userRolesRebuilderService;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * Users constructor.
     *
     * @param AppFacade\User                 $userFacade
     * @param Facade\Organisation            $organisationFacade
     * @param Facade\LabelingGroup           $labelingGroupFacade
     * @param Facade\Project                 $projectFacade
     * @param Storage\TokenStorage           $tokenStorage
     * @param Service\Authorization          $authorizationService
     * @param Service\UserRolesRebuilder     $userRolesRebuilderService
     * @param Validation\ValidationService   $validationService
     * @param AMQP\FacadeAMQP                $amqpFacade
     * @param Authentication\UserPermissions $userPermissions
     */
    public function __construct(
        AppFacade\User $userFacade,
        Facade\Organisation $organisationFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\Project $projectFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService,
        Service\UserRolesRebuilder $userRolesRebuilderService,
        Validation\ValidationService $validationService,
        AMQP\FacadeAMQP $amqpFacade,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->userFacade                = $userFacade;
        $this->tokenStorage              = $tokenStorage;
        $this->authorizationService      = $authorizationService;
        $this->organisationFacade        = $organisationFacade;
        $this->labelingGroupFacade       = $labelingGroupFacade;
        $this->projectFacade             = $projectFacade;
        $this->userRolesRebuilderService = $userRolesRebuilderService;
        $this->validationService         = $validationService;
        $this->amqpFacade                = $amqpFacade;
        $this->userPermissions           = $userPermissions;
    }

    /**
     * Get all users
     *
     * @Rest\Get("")
     * @Security("has_role('ROLE_SUPER_ADMIN')")
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUsersListAction()
    {
        $users = $this->userFacade->getUserList();

        $users = array_map(function (Model\User $user) {
            return array(
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'enabled' => $user->isEnabled(),
                'lastLogin' => $user->getLastLogin(),
                'locked' => $user->isLocked(),
                'roles' => $user->getRoles(),
            );
        }, $users);

        return View\View::create()->setData(['result' => ['users' => $users]]);
    }

    /**
     * Get a single user
     *
     * @Rest\Get("/{user}")
     *
     * @param Model\User $user
     *
     * @return View\View
     */
    public function getUserAction(Model\User $user)
    {
        /** @var Model\User $loginUser */
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if (!$user->hasRole(Model\User::ROLE_SUPER_ADMIN) && !$loginUser->hasRole(Model\User::ROLE_SUPER_ADMIN) &&
            count(array_intersect($user->getOrganisations(), $loginUser->getOrganisations())) === 0) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to get this user');
        }

        return View\View::create()->setData(
            [
                'result' =>
                    [
                        'user' => $this->getUserResponse($user),
                        'organisations' => $this->organisationFacade->findByIds($this->getOrganisationsForUser($user)),
                    ],
            ]
        );
    }

    /**
     * Add a new User
     *
     * @Rest\Post("")
     *
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     */
    public function addUserAction(HttpFoundation\Request $request)
    {
        if (!$this->userPermissions->hasPermission('canAddUser')) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to edit users');
        }


        $user = new Model\User();
        $user->setEmail($request->request->get('email'));
        $user->setPlainPassword($request->request->get('password'));

        $validationResult = $this->validationService->validate($user);
        if ($validationResult->hasErrors()) {
            return View\View::create()->setData(
                [
                    'result' =>
                        [
                            'error' => $validationResult->getErrors(),
                        ],
                ]
            );
        }


        $roles = $request->request->get('roles', array());
        $user = $this->userFacade->createUser(
            $request->request->get('username'),
            $request->request->get('email'),
            $request->request->get('password'),
            $request->request->getBoolean('enabled'),
            $request->request->getBoolean('locked')
        );

        foreach ($roles as $role) {
            $user->addRole($role);
        }
        $this->userFacade->updateUser($user);
        // This rebuild only affects superadmins because new users have no organisations yet
        $this->userRolesRebuilderService->rebuildForUser($user);

        return View\View::create()->setData(
            [
                'result' =>
                    [
                        'user' => $this->getUserResponse($user),
                        'organisations' => $this->organisationFacade->findByIds($this->getOrganisationsForUser($user)),
                    ],
            ]
        );
    }

    /**
     * Edit a User
     *
     * @Rest\Put("/{user}")
     *
     * @param HttpFoundation\Request              $request
     * @param Model\User                          $user
     *
     * @return View\View|\FOS\RestBundle\View\View
     */
    public function editUserAction(HttpFoundation\Request $request, Model\User $user)
    {
        /** @var Model\User $loginUser */
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if (!$this->userPermissions->hasPermission('canEditUser')) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to edit users');
        }

        if (!$this->userPermissions->hasPermission('canAssignUserToAnyOrganisation') &&
            count(array_diff($user->getOrganisations(), $loginUser->getOrganisations())) > 0) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to edit this user in this organisation');
        }

        $roles = $request->request->get('roles', array());
        $user->setUsername($request->request->get('username'));
        $user->setEmail($request->request->get('email'));

        if ($request->request->has('password')) {
            $user->setPlainPassword($request->request->get('password'));

            $validationResult = $this->validationService->validate($user);
            if ($validationResult->hasErrors()) {
                return View\View::create()->setData(
                    [
                        'result' =>
                            [
                                'error' => $validationResult->getErrors(),
                            ],
                    ]
                );
            }
        }
        $this->removeAllUserRoles($user);
        foreach ($roles as $role) {
            $user->addRole($role);
        }

        if ($request->request->get('expiresAt') !== null) {
            $expiresAt = new \DateTime($request->request->get('expiresAt'), new \DateTimeZone('UTC'));
            $user->setExpiresAt($expiresAt);
            $user->setCredentialsExpireAt($expiresAt);
        } else {
            $user->setExpiresAt(null);
            $user->setCredentialsExpireAt(null);
        }

        $this->userFacade->updateUser($user);
        $this->userRolesRebuilderService->rebuildForUser($user);

        if ($user->getUsername() === $loginUser->getUsername()) {
            $this->tokenStorage->setToken(null);

            return View\View::createRedirect('fos_user_security_logout');
        }

        return View\View::create()->setData(
            [
                'result' =>
                    [
                        'user' => $this->getUserResponse($user),
                        'organisations' => $this->organisationFacade->findByIds($this->getOrganisationsForUser($user)),
                    ],
            ]
        );
    }

    /**
     * @param Model\User $user
     * @return array
     */
    private function getUserResponse(Model\User $user)
    {
        $response = array(
            'id'            => $user->getId(),
            'username'      => $user->getUsername(),
            'email'         => $user->getEmail(),
            'enabled'       => $user->isEnabled(),
            'lastLogin'     => $user->getLastLogin(),
            'locked'        => $user->isLocked(),
            'roles'         => $user->getRoles(),
            'expired'       => $user->isExpired(),
            'expiresAt'     => $user->getExpiresAt() ? $user->getExpiresAt()->format('c') : null,
            'organisations' => [],
        );
        $response['organisations'] = $this->getOrganisationsForUser($user);

        return $response;
    }

    /**
     * @param Model\User $user
     * @return array
     */
    private function getOrganisationsForUser(Model\User $user)
    {
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if ($this->userPermissions->hasPermission('canAssignUserToAnyOrganisation')) {
            return $user->getOrganisations();
        }

        if ($this->userPermissions->hasPermission('canAssignUserToOwnOrganisation')) {
            return array_intersect($user->getOrganisations(), $loginUser->getOrganisations());
        }

        return [];
    }

    /**
     * Delete a User
     *
     * @Rest\Delete("/{user}")
     * @CheckPermissions({"canDeleteUser"})
     *
     * @param Model\User                          $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteUserAction(Model\User $user)
    {
        /** @var Model\User $loginUser */
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if (!$loginUser->hasRole(Model\User::ROLE_SUPER_ADMIN) &&
            count(array_intersect($user->getOrganisations(), $loginUser->getOrganisations())) === 0) {
            throw new Exception\AccessDeniedHttpException('Your are not allowed to deleted this user');
        }

        $this->userFacade->deleteUser($user);
        $this->deleteUserFromLabelingGroups($user);
        $this->removeAllLabelingTaskAssignmentsForUser($user);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @param Model\User $user
     */
    private function removeAllLabelingTaskAssignmentsForUser(Model\User $user)
    {
        foreach ($user->getOrganisations() as $organisationId) {
            $organisation = $this->organisationFacade->find($organisationId);
            $projects   = $this->projectFacade->findAllByOrganisation($organisation)->toArray();
            $projectIds = array_map(
                function (Model\Project $project) {
                    return $project->getId();
                },
                $projects
            );

            $job = new Jobs\DeleteProjectAssignmentsForUserJobCreator($user->getId(), $projectIds);
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }
    }

    /**
     * @param Model\User $user
     */
    private function deleteUserFromLabelingGroups(Model\User $user)
    {
        $labelingGroups = $this->labelingGroupFacade->findAllByUser($user);

        /** @var Model\LabelingGroup $labelingGroup */
        foreach ($labelingGroups as $labelingGroup) {
            $this->labelingGroupFacade->deleteUserFromLabelGroup($labelingGroup, $user);
        }
    }

    /**
     * Remove all user roles
     *
     * @param Model\User $user
     * @return Model\User
     */
    private function removeAllUserRoles(Model\User $user)
    {
        $roles = $user->getRoles();
        foreach ($roles as $role) {
            $user->removeRole($role);
        }

        return $user;
    }
}
