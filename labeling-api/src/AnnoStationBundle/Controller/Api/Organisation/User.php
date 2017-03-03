<?php

namespace AnnoStationBundle\Controller\Api\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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
     * Users constructor.
     *
     * @param AppFacade\User                 $userFacade
     * @param Service\Authorization          $authorizationService
     * @param Authentication\UserPermissions $userPermissions
     */
    public function __construct(
        AppFacade\User $userFacade,
        Service\Authorization $authorizationService,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->userFacade           = $userFacade;
        $this->authorizationService = $authorizationService;
        $this->userPermissions      = $userPermissions;
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

        if (!$this->userPermissions->hasPermission('canAddUserToOrganisation')) {
            throw new AccessDeniedHttpException();
        }

        $userLimit = $organisation->getUserQuota();

        if ($userLimit !== 0 && $userLimit <= count($this->userFacade->getUserList($organisation))) {
            throw new BadRequestHttpException('You reached your user limit of ' . $userLimit);
        }

        $user->assignToOrganisation($organisation);
        $this->userFacade->updateUser($user);

        return View\View::create()->setData(['success' => true]);
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

        return View\View::create()->setData(['success' => true]);
    }
}
