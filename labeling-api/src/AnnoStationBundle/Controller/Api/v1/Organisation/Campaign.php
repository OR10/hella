<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation;

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
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.campaign")
 *
 * @CloseSession
 */
class Campaign extends Controller\Base
{
    /**
     * @var Facade\Campaign
     */
    private $campaignFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * Campaign constructor.
     *
     * @param Facade\Campaign       $campaignFacade
     * @param Service\Authorization $authorizationService
     */
    public function __construct(Facade\Campaign $campaignFacade, Service\Authorization $authorizationService)
    {
        $this->campaignFacade       = $campaignFacade;
        $this->authorizationService = $authorizationService;
    }

    /**
     *
     * @Rest\Get("/{organisation}/campaign")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function listCampaignsAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        return View\View::create()->setData(
            [
                'result' => $this->campaignFacade->getCampaignByOrganisation($organisation),
            ]
        );
    }

    /**
     * @Rest\Post("/{organisation}/campaign")
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function addCampaignAction(
        HttpFoundation\Request $request,
        AnnoStationBundleModel\Organisation $organisation
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $name = $request->request->get('name');

        if (count($this->campaignFacade->getCampaignByOrganisationAndName($organisation, $name)) > 0) {
            throw new Exception\ConflictHttpException('Campaign with this name already exists');
        }

        $campaign = new AnnoStationBundleModel\Campaign($organisation, $name);

        $this->campaignFacade->save($campaign);

        return View\View::create()->setData(
            [
                'result' => $campaign,
            ]
        );
    }
}
