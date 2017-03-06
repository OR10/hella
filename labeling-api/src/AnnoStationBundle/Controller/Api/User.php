<?php

namespace AnnoStationBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\RedirectView;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/user")
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
     * Users constructor.
     *
     * @param AppFacade\User        $userFacade
     * @param Storage\TokenStorage  $tokenStorage
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        AppFacade\User $userFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService
    ) {
        $this->userFacade           = $userFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->authorizationService = $authorizationService;
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
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
     *
     * @param Model\User                          $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUserAction(Model\User $user)
    {
        /** @var Model\User $loginUser */
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if (!$loginUser->hasRole(Model\User::ROLE_SUPER_ADMIN) &&
            count(array_intersect($user->getOrganisations(), $loginUser->getOrganisations())) === 0) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to get this user');
        }

        return View\View::create()->setData(
            ['result' => ['user' => $this->getUserResponse($user)]]
        );
    }

    /**
     * Add a new User
     *
     * @Rest\Post("")
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
     *
     * @param HttpFoundation\Request              $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function addUserAction(HttpFoundation\Request $request)
    {
        /** @var Model\User $loginUser */
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if (!$loginUser->hasRole(Model\User::ROLE_SUPER_ADMIN) &&
            count(array_diff($request->request->get('organisationIds'), $loginUser->getOrganisations())) > 0) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to add this user to this organisations');
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

        return View\View::create()->setData(['result' => ['user' => $this->getUserResponse($user)]]);
    }

    /**
     * Edit a User
     *
     * @Rest\Put("/{user}")
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
     *
     * @param HttpFoundation\Request              $request
     * @param Model\User                          $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function editUserAction(HttpFoundation\Request $request, Model\User $user)
    {
        /** @var Model\User $loginUser */
        $loginUser = $this->tokenStorage->getToken()->getUser();

        if (!$loginUser->hasRole(Model\User::ROLE_SUPER_ADMIN) &&
            count(array_diff($request->request->get('organisationIds'), $loginUser->getOrganisations())) > 0) {
            throw new Exception\AccessDeniedHttpException('You are not allowed to add this user to this organisations');
        }

        $roles = $request->request->get('roles', array());
        $user->setUsername($request->request->get('username'));
        $user->setEmail($request->request->get('email'));

        if ($request->request->has('password')) {
            $user->setPlainPassword($request->request->get('password'));
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
        if ($user->getUsername() === $loginUser->getUsername()) {
            $this->tokenStorage->setToken(null);

            return RedirectView::create('fos_user_security_logout');
        }

        return View\View::create()->setData(['result' => ['user' => $this->getUserResponse($user)]]);
    }

    /**
     * @param Model\User $user
     * @return array
     */
    private function getUserResponse(Model\User $user)
    {
        return array(
            'id'        => $user->getId(),
            'username'  => $user->getUsername(),
            'email'     => $user->getEmail(),
            'enabled'   => $user->isEnabled(),
            'lastLogin' => $user->getLastLogin(),
            'locked'    => $user->isLocked(),
            'roles'     => $user->getRoles(),
            'expired'   => $user->isExpired(),
            'expiresAt' => $user->getExpiresAt() ? $user->getExpiresAt()->format('c') : null,
        );
    }

    /**
     * Delete a User
     *
     * @Rest\Delete("/{user}")
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
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
            throw new Exception\AccessDeniedHttpException('You are not allowed to get this user');
        }

        $this->userFacade->deleteUser($user);

        return View\View::create()->setData(['result' => ['success' => true]]);
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
        $this->userFacade->updateUser($user);

        return $user;
    }
}
