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
}
