<?php

namespace AppBundle\Controller;

use AppBundle\Annotations\CloseSession;
use AppBundle\Model;
use AppBundle\Database\Facade;
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
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Twig\TwigEngine       $twigEngine
     * @param Service\VideoImporter $videoImporterService
     * @param Facade\Project        $projectFacade
     */
    public function __construct(
        Twig\TwigEngine $twigEngine,
        Service\VideoImporter $videoImporterService,
        Facade\Project $projectFacade
    ) {
        $this->twigEngine           = $twigEngine;
        $this->videoImporterService = $videoImporterService;
        $this->projectFacade        = $projectFacade;
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
        $viewData                 = array();
        $viewData['projectNames'] = array_map(
            function (Model\Project $project) {
                return $project->getName();
            },
            $this->projectFacade->findAll()
        );

        return new Response(
            $this->twigEngine->render(
                'AppBundle:default:uploadForm.html.twig',
                $viewData
            )
        );
    }

    /**
     * @Configuration\Route("/upload")
     * @Configuration\Method({"POST"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return Response
     */
    public function uploadPostAction(HttpFoundation\Request $request)
    {
        $viewData = [];

        /**
         * @var UploadedFile $file
         */
        $file               = $request->files->get('file');
        $calibrationFile    = $request->files->get('calibrationFile');
        $projectName        = $request->request->get('project');
        $splitLength        = $request->request->getInt('splitLength', 0);
        $lossless           = $request->request->get('lossless', false);
        $objectLabeling     = $request->request->get('object-labeling', false);
        $metaLabeling       = $request->request->get('meta-labeling', false);
        $overflow           = (bool) $request->request->get('overflow', false);
        $drawingToolVehicle = $request->request->get('drawingToolVehicle', 'rectangle');
        $drawingToolPerson  = $request->request->get('drawingToolPerson', 'pedestrian');
        $drawingToolCyclist = $request->request->get('drawingToolCyclist', 'rectangle');
        $drawingToolIgnore  = $request->request->get('drawingToolIgnore', 'rectangle');
        $drawingToolIgnoreVehicle  = $request->request->get('drawingToolIgnoreVehicle', 'rectangle');
        $drawingToolOptions = array(
            'pedestrian' => array(
                'minimalHeight' => $request->request->get('pedestrianMinimalHeight', '22'),
            ),
            'cuboid' => array(
                'minimalHeight' => $request->request->get('cuboidMinimalHeight', '15'),
            ),
        );

        $frameStepSize = $request->request->get('frameStepSize', 1);
        $startFrame = $request->request->get('startFrame', 1);

        //Label instructions
        $labelInstructions = array();
        if ($request->request->get('vehicle', false)) {
            $labelInstructions[] = array(
                'instruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                'drawingTool' => $drawingToolVehicle,
            );
        }
        if ($request->request->get('person', false)) {
            $labelInstructions[] = array(
                'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                'drawingTool' => $drawingToolPerson,
            );
        }
        if ($request->request->get('cyclist', false)) {
            $labelInstructions[] = array(
                'instruction' => Model\LabelingTask::INSTRUCTION_CYCLIST,
                'drawingTool' => $drawingToolCyclist,
            );
        }
        if ($request->request->get('ignore', false)) {
            $labelInstructions[] = array(
                'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE,
                'drawingTool' => $drawingToolIgnore,
            );
        }
        if ($request->request->get('ignore-vehicle', false)) {
            $labelInstructions[] = array(
                'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                'drawingTool' => $drawingToolIgnoreVehicle,
            );
        }

        if ($splitLength < 0) {
            throw new Exception\BadRequestHttpException();
        }

        $viewData['projectNames'] = array_map(
            function (Model\Project $project) {
                return $project->getName();
            },
            $this->projectFacade->findAll()
        );

        if ($file === null) {
            $viewData['error'] = 'No file given.';
        } else if (empty($projectName)) {
            $viewData['error'] = 'No Project specified.';
        } else {
            $tasks = $this->videoImporterService->import(
                $file->getClientOriginalName(),
                $projectName,
                $file,
                $calibrationFile,
                $lossless,
                $splitLength,
                $objectLabeling,
                $metaLabeling,
                $labelInstructions,
                $overflow ? 16 : null,
                $drawingToolOptions,
                $frameStepSize,
                $startFrame
            );

            $viewData['taskIds'] = array_map(
                function (Model\LabelingTask $task) {
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
