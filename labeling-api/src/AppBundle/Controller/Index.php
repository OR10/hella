<?php

namespace AppBundle\Controller;

use AppBundle\Model;
use AppBundle\Service;
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
     * @var Twig\TwigEngine
     */
    private $twigEngine;
    /**
     * @var Service\ImporterService
     */
    private $importerService;

    /**
     * @param Twig\TwigEngine          $twigEngine
     * @param Service\ImporterService  $importerService
     */
    public function __construct(
        Twig\TwigEngine $twigEngine,
        Service\ImporterService $importerService
    ) {
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
        return new Response($this->twigEngine->render('AppBundle:default:uploadForm.html.twig'));
    }

    /**
     * @Configuration\Route("/upload")
     * @Configuration\Method({"POST"})
     */
    public function uploadPostAction(HttpFoundation\Request $request)
    {
        $viewData = [];

        /**
         * @var UploadedFile $file
         */
        $file       = $request->files->get('file');
        $compressed = $request->request->get('compressed', false);

        if ($file === null) {
            $viewData['error'] = 'No file given';
        } else {
            $task = $this->importerService->import($file->getClientOriginalName(), $file, $compressed);
            $viewData['taskId'] = $task->getId();
        }

        return new Response(
            $this->twigEngine->render(
                'AppBundle:default:uploadForm.html.twig',
                $viewData
            )
        );
    }
}
