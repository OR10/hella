<?php

namespace AppBundle\Controller;

use AppBundle\Annotations\CloseSession;
use AppBundle\Model;
use AppBundle\Service;
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
     * @param Twig\TwigEngine       $twigEngine
     * @param Service\VideoImporter $videoImporterService
     */
    public function __construct(
        Twig\TwigEngine $twigEngine,
        Service\VideoImporter $videoImporterService
    ) {
        $this->twigEngine           = $twigEngine;
        $this->videoImporterService = $videoImporterService;
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
        $file = $request->files->get('file');
        $splitLength = $request->request->getInt('splitLength', 0);
        $lossless = $request->request->get('lossless', false);
        $objectLabeling = $request->request->get('object-labeling', false);
        $metaLabeling = $request->request->get('meta-labeling', false);
        $pedestrian = $request->request->get('pedestrian', false);
        $vehicle = $request->request->get('vehicle', false);

        if ($splitLength < 0) {
            throw new Exception\BadRequestHttpException();
        }

        if ($file === null) {
            $viewData['error'] = 'No file given';
        } else {
            $tasks = $this->videoImporterService->import(
                $file->getClientOriginalName(),
                $file,
                $lossless,
                $splitLength,
                $objectLabeling,
                $metaLabeling,
                $vehicle,
                $pedestrian
            );

            $viewData['taskIds'] = array_map(
                function ($task) {
                    return $task->getId();
                },
                $tasks
            );
        }

        return new Response(
            $this->twigEngine->render(
                'AppBundle:default:uploadForm.html.twig',
                $viewData
            )
        );
    }
}
