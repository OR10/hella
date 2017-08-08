<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\View;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project_count")
 *
 * @CloseSession
 */
class ProjectCount extends Controller\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * ProjectCount constructor.
     *
     * @param Facade\Project        $projectFacade
     * @param Storage\TokenStorage  $tokenStorage
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Facade\Project $projectFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService
    ) {
        $this->projectFacade        = $projectFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->authorizationService = $authorizationService;
    }

    /**
     * @Rest\Get("/{organisation}/projectCount")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getProjectCountAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $states = [
            Model\Project::STATUS_TODO,
            Model\Project::STATUS_IN_PROGRESS,
            Model\Project::STATUS_DONE,
            Model\Project::STATUS_DELETED,
        ];

        $sum = array();
        foreach ($states as $status) {
            if (!array_key_exists($status, $sum)) {
                $sum[$status] = 0;
            }
            foreach ($this->projectFacade->findAllByUserAndStatus($organisation, $user, $status, true)->toArray(
            ) as $sumByStatus) {
                $sum[$status] = $sumByStatus['value'];
            }
        }

        return View\View::create()->setData(
            [
                'result' => $sum,
            ]
        );
    }
}
