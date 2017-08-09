<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use FOS\RestBundle\View\RedirectView;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
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
     * @var Service\Authentication\UserPermissions
     */
    private $currentUserPermissions;

    /**
     * Users constructor.
     *
     * @param AppFacade\User        $userFacade
     * @param Storage\TokenStorage  $tokenStorage
     * @param Service\Authorization $authorizationService
     * @param Service\Authentication\UserPermissions $userPermissions
     */
    public function __construct(
        AppFacade\User $userFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService,
        Service\Authentication\UserPermissions $userPermissions
    ) {
        $this->userFacade               = $userFacade;
        $this->tokenStorage             = $tokenStorage;
        $this->authorizationService     = $authorizationService;
        $this->currentUserPermissions   = $userPermissions;
    }

    /**
     * Get all users
     *
     * @Rest\Get("/{organisation}/users")
     * @Security("has_role('ROLE_ADMIN') or has_role('ROLE_SUPER_ADMIN')")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUsersListAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $users = $this->userFacade->getUserList($organisation);
        // Remove Superadmin from Userlist if user does not have permission to list all users
        $users = $this->filterUserListByPermission($users);

        $users = array_map(function (Model\User $user) {
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
        }, $users);

        return View\View::create()->setData(['result' => ['users' => $users]]);
    }

    /**
     * Remove Superadmin from User list if the current user does not have the permission
     * to list all users
     *
     * @param $users
     * @return array
     */
    private function filterUserListByPermission($users)
    {
        $users = array_values(array_filter($users, function (Model\User $user) {
            $authUserCanListAllUsers = $this->currentUserPermissions->hasPermission('canListAllUsers');

            if ($user->isSuperAdmin() && !$authUserCanListAllUsers) {
                return false;
            }

            return true;
        }));

        return $users;
    }
}
