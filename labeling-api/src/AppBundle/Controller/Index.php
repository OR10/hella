<?php

namespace AppBundle\Controller;

use AppBundle\Service\ImporterService;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Bridge\Twig;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * @Configuration\Route("/", service="annostation.labeling_api.controller.index")
 */
class Index extends Base
{
    /**
     * @var TwigEngine
     */
    private $twigEngine;
    /**
     * @var ImporterService
     */
    private $importerService;

    function __construct(Twig\TwigEngine $twigEngine, ImporterService $importerService)
    {
        $this->twigEngine      = $twigEngine;
        $this->importerService = $importerService;
    }

    /**
     * @Configuration\Route("/")
     */
    public function indexAction(HttpFoundation\Request $request)
    {
        return new RedirectResponse('/labeling');
    }

    /**
     * @Configuration\Route("/upload")
     * @Configuration\Method({"GET"})
     */
    public function uploadGetAction(HttpFoundation\Request $request)
    {
        return new Response(
            $this->twigEngine->render(
                'AppBundle:default:uploadForm.html.twig'
            )
        );
    }

    /**
     * @Configuration\Route("/upload")
     * @Configuration\Method({"POST"})
     */
    public function uploadPostAction(HttpFoundation\Request $request)
    {
        /**
         * @var UploadedFile $file
         */
        $filename = $request->files->get('file');
        $stream   = fopen($filename, 'r+');

        $task = $this->importerService->import($filename, $stream);

        return new Response(
            $this->twigEngine->render(
                'AppBundle:default:uploadForm.html.twig',
                ['taskId' => $task->getId()]
            )
        );
    }
}
