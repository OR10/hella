<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/video")
 * @Rest\Route(service="annostation.labeling_api.controller.api.video")
 *
 * @CloseSession
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
        return View\View::create()->setData(['result' => $this->videoFacade->findAll()]);
    }

    /**
     * @Rest\Get("/{video}")
     *
     * @param $video
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getVideoAction(Model\Video $video)
    {
        return View\View::create()->setData(['result' => $video]);
    }
}
