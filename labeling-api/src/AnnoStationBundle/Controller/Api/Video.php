<?php

namespace AnnoStationBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use AppBundle\Response;

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

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @param Facade\Video           $videoFacade
     * @param Facade\CalibrationData $calibrationDataFacade
     */
    public function __construct(Facade\Video $videoFacade, Facade\CalibrationData $calibrationDataFacade)
    {
        $this->videoFacade           = $videoFacade;
        $this->calibrationDataFacade = $calibrationDataFacade;
    }

    /**
     * @Rest\Get("")
     */
    public function listAction()
    {
        return new View\View(
            new Response\Videos($this->videoFacade->findAll(), $this->calibrationDataFacade)
        );
    }

    /**
     * @Rest\Get("/{video}")
     *
     * @param $video
     *
     * @return View\View
     */
    public function getVideoAction(Model\Video $video)
    {
        return new View\View(
            new Response\Video($video, $this->calibrationDataFacade)
        );
    }
}
