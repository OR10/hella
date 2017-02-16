<?php

namespace AnnoStationBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\View;
use AppBundle\Model;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/projectCount")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project_count")
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
     * ProjectCount constructor.
     * @param Facade\Project       $projectFacade
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(Facade\Project $projectFacade, Storage\TokenStorage $tokenStorage)
    {
        $this->projectFacade = $projectFacade;
        $this->tokenStorage  = $tokenStorage;
    }

    /**
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getProjectCountAction(HttpFoundation\Request $request)
    {
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
            foreach ($this->projectFacade->findAllByUserAndStatus($user, $status, true)->toArray() as $sumByStatus) {
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
