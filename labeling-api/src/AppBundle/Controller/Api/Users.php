<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/users")
 * @Rest\Route(service="annostation.labeling_api.controller.api.users")
 *
 * @CloseSession
 */
class Users extends Controller\Base
{
    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * Users constructor.
     * @param Facade\User $userFacade
     */
    public function __construct(Facade\User $userFacade)
    {
        $this->userFacade = $userFacade;
    }


    /**
     * Get all users
     *
     * @Rest\Get("")
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
     * @return \FOS\RestBundle\View\View
     */
    public function getUserAction(Model\User $user)
    {
        return View\View::create()->setData(
            ['result' =>
                ['user' =>
                    array(
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'email' => $user->getEmail(),
                    'enabled' => $user->isEnabled(),
                    'lastLogin' => $user->getLastLogin(),
                    'locked' => $user->isLocked(),
                    'roles' => $user->getRoles(),
                    )
                ]
            ]);
    }

    /**
     * Add a new User
     *
     * @Rest\Post("")
     *
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function addUserAction(HttpFoundation\Request $request)
    {
        $roles = $request->request->get('roles', array());
        $user = $this->userFacade->createUser(
            $request->request->get('username'),
            $request->request->get('email'),
            $request->request->get('password')
        );

        foreach($roles as $role) {
            $user->addRole($role);
        }
        $this->userFacade->updateUser($user);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Edit a User
     *
     * @Rest\Put("/{user}")
     *
     * @param HttpFoundation\Request $request
     * @param Model\User $user
     * @return \FOS\RestBundle\View\View
     */
    public function editUserAction(HttpFoundation\Request $request, Model\User $user)
    {
        $roles = $request->request->get('roles', array());
        $user->setUsername($request->request->get('username'));
        $user->setEmail($request->request->get('email'));

        if ($request->query->has('password')) {
            $user->setPassword($request->request->get('password'));
        }
        $this->removeAllUserRoles($user);
        foreach($roles as $role) {
            $user->addRole($role);
        }

        $this->userFacade->updateUser($user);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Delete a User
     *
     * @Rest\Delete("/{user}")
     *
     * @param $user
     * @return \FOS\RestBundle\View\View
     */
    public function deleteUserAction(Model\User $user)
    {
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
        foreach($roles as $role) {
            $user->removeRole($role);
        }
        $this->userFacade->updateUser($user);

        return $user;
    }
}