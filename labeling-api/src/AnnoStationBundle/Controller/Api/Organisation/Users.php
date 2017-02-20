<?php

namespace AnnoStationBundle\Controller\Api\Organisation;

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
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.users")
 *
 * @CloseSession
 */
class Users extends Controller\Base
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
     * @Rest\Get("/{organisation}/users")
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUsersListAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

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
     * @Rest\Get("/{organisation}/users/{user}")
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUserAction(AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        return View\View::create()->setData(
            ['result' => ['user' => $this->getUserResponse($user)]]
        );
    }

    /**
     * Add a new User
     *
     * @Rest\Post("/{organisation}/users")
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function addUserAction(AnnoStationBundleModel\Organisation $organisation, HttpFoundation\Request $request)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

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
     * @Rest\Put("/{organizationId}/users/{user}")
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     * @param Model\User                          $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function editUserAction(AnnoStationBundleModel\Organisation $organisation, HttpFoundation\Request $request, Model\User $user)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $loginUser = $this->tokenStorage->getToken()->getUser();

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
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'enabled' => $user->isEnabled(),
            'lastLogin' => $user->getLastLogin(),
            'locked' => $user->isLocked(),
            'roles' => $user->getRoles(),
        );
    }

    /**
     * Delete a User
     *
     * @Rest\Delete("/{organisation}/users/{user}")
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteUserAction(AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

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
