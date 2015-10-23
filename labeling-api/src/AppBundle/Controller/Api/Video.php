<?php

namespace AppBundle\Controller\Api;

use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;

/**
 * @Rest\Prefix("/api/video")
 * @Rest\Route(service="annostation.labeling_api.controller.api.video")
 */
class Video extends Controller\Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    public function __construct(Facade\Video $videoFacade)
    {
        $this->videoFacade = $videoFacade;
    }

    /**
     * @Rest\Get("")
     */
    public function listAction()
    {
        return View\View::create()
            ->setData(['result' => $this->videoFacade->findAll()]);
    }
}
