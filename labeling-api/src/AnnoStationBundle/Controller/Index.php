<?php

namespace AnnoStationBundle\Controller;

use AppBundle\Annotations\CloseSession;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Bridge\Twig;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Configuration\Route("/", service="annostation.labeling_api.controller.index")
 *
 * @CloseSession
 */
class Index extends Base
{
    /**
     * @var Twig\TwigEngine
     */
    private $twigEngine;
    /**
     * @var Service\VideoImporter
     */
    private $videoImporterService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var string
     */
    private $redirectAfterLogin;

    /**
     * @param Twig\TwigEngine       $twigEngine
     * @param Service\VideoImporter $videoImporterService
     * @param Facade\Project        $projectFacade
     * @param string                $redirectAfterLogin
     */
    public function __construct(
        Twig\TwigEngine $twigEngine,
        Service\VideoImporter $videoImporterService,
        Facade\Project $projectFacade,
        string $redirectAfterLogin
    ) {
        $this->twigEngine           = $twigEngine;
        $this->videoImporterService = $videoImporterService;
        $this->projectFacade        = $projectFacade;
        $this->redirectAfterLogin   = $redirectAfterLogin;
    }

    /**
     * @Configuration\Route("/")
     */
    public function indexAction()
    {
        return new RedirectResponse($this->redirectAfterLogin);
    }
}
