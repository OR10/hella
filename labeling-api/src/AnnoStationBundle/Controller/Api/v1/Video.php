<?php

namespace AnnoStationBundle\Controller\Api\v1;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use AnnoStationBundle\Response;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/video")
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
