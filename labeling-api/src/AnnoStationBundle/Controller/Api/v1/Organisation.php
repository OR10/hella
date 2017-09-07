<?php

namespace AnnoStationBundle\Controller\Api\v1;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Response;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation")
 *
 * @CloseSession
 */
class Organisation extends Controller\Base
{
    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    public function __construct(
        Facade\Organisation $organisationFacade,
        Facade\Video $videoFacade,
        Facade\Project $projectFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->organisationFacade   = $organisationFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->videoFacade          = $videoFacade;
        $this->projectFacade        = $projectFacade;
        $this->authorizationService = $authorizationService;
        $this->userPermissions      = $userPermissions;
    }

    /**
     * @Rest\Get("")
     * @Annotations\CheckPermissions({"canListOrganisations"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $skip  = $request->request->get('skip');
        $limit = $request->request->get('limit');

        if ($this->userPermissions->hasPermission('canListAllOrganisations')) {
            $organisations = $this->organisationFacade->findAll($skip, $limit);
        } else {
            /** @var Model\User $user */
            $user          = $this->tokenStorage->getToken()->getUser();
            $organisations = $this->organisationFacade->findByIds($user->getOrganisations());
        }

        return new View\View(
            new Response\SimpleOrganisations(
                $organisations,
                $this->videoFacade->getNumberOfVideosByOrganisations(),
                $this->projectFacade->getNumberOfProjectsByOrganisations(),
                $this->organisationFacade
            )
        );
    }

    /**
     * @Rest\Post("")
     * @Annotations\CheckPermissions({"canCreateOrganisation"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function createAction(HttpFoundation\Request $request)
    {
        $name      = $request->request->get('name');
        $quota     = $request->request->get('quota', 0);
        $userQuota = $request->request->get('userQuota', 0);

        $organisation = new AnnoStationBundleModel\Organisation($name, $quota, $userQuota);
        $this->organisationFacade->save($organisation);

        return new View\View(['result' => $organisation]);
    }

    /**
     * @Rest\Put("/{organisation}")
     * @Annotations\CheckPermissions({"canEditOrganisation"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     */
    public function updateAction(AnnoStationBundleModel\Organisation $organisation, HttpFoundation\Request $request)
    {
        $rev       = $request->request->get('rev');
        $name      = $request->request->get('name');
        $quota     = $request->request->get('quota');
        $userQuota = $request->request->get('userQuota');

        if ($organisation->getRev() !== $rev) {
            throw new Exception\ConflictHttpException();
        }

        $organisation->setName($name);
        if ($quota !== null) {
            $organisation->setQuota($quota);
        }
        $organisation->setUserQuota($userQuota);
        $this->organisationFacade->save($organisation);

        return new View\View(['result' => $organisation]);
    }

    /**
     * @Rest\Delete("/{organisation}")
     * @Annotations\CheckPermissions({"canDeleteOrganisation"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     */
    public function deleteAction(AnnoStationBundleModel\Organisation $organisation, HttpFoundation\Request $request)
    {
        $this->organisationFacade->delete($organisation);

        return new View\View(['success' => true]);
    }
}
