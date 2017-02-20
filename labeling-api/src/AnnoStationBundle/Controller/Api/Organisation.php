<?php

namespace AnnoStationBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/organisation")
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

    public function __construct(Facade\Organisation $organisationFacade, Storage\TokenStorage $tokenStorage)
    {
        $this->organisationFacade = $organisationFacade;
        $this->tokenStorage       = $tokenStorage;
    }

    /**
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $this->hasUserOrganisationManagePermission();

        $skip  = $request->request->get('skip');
        $limit = $request->request->get('limit');

        return new View\View(
            $this->organisationFacade->findAll($skip, $limit)
        );
    }

    /**
     * @Rest\Post("")
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function createAction(HttpFoundation\Request $request)
    {
        $this->hasUserOrganisationManagePermission();

        $name = $request->request->get('name');

        $organisation = new AnnoStationBundleModel\Organisation($name);
        $this->organisationFacade->save($organisation);

        return new View\View($organisation);
    }

    /**
     * @Rest\Put("/{organisation}")
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     */
    public function updateAction(AnnoStationBundleModel\Organisation $organisation, HttpFoundation\Request $request)
    {
        $this->hasUserOrganisationManagePermission();

        $rev  = $request->request->get('rev');
        $name = $request->request->get('name');

        if ($organisation->getRev() !== $rev) {
            throw new Exception\ConflictHttpException();
        }

        $organisation->setName($name);
        $this->organisationFacade->save($organisation);

        return new View\View($organisation);
    }

    /**
     * @Rest\Delete("/{organisation}")
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     */
    public function deleteAction(AnnoStationBundleModel\Organisation $organisation, HttpFoundation\Request $request)
    {
        $this->hasUserOrganisationManagePermission();

        $this->organisationFacade->delete($organisation);

        return new View\View(['success' => true]);
    }

    private function hasUserOrganisationManagePermission()
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();
        if (!$user->hasRole(Model\User::ROLE_SUPER_ADMIN)) {
            throw new Exception\AccessDeniedHttpException();
        }
    }
}
