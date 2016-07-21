<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

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
     * ProjectCount constructor.
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        $this->projectFacade = $projectFacade;
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
        $sum = array();
        foreach($this->projectFacade->getSumOfProjectsByStatus()->toArray() as $sumByStatus) {
            $sum[$sumByStatus['key'][0]] = $sumByStatus['value'];
        }

        return View\View::create()->setData(
            [
                'result' => $sum,
            ]
        );
    }
}