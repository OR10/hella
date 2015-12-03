<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Service;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/labeledThingInFrame")
 * @Rest\Route(service="annostation.labeling_api.controller.api.labeled_thing_in_frame")
 *
 * @CloseSession
 */
class LabeledThingInFrame extends Controller\Base
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
    }

    /**
     * @Rest\Get("/{labeledThingInFrame}")
     *
     * @param Model\LabeledThingInFrame $documentId
     * @param HttpFoundation\Request    $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function getLabeledThingInFrameAction(
        Model\LabeledThingInFrame $labeledThingInFrame,
        HttpFoundation\Request $request
    ) {
        return View\View::create()->setData(['result' => array('success' => true, 'data' => $labeledThingInFrame)]);
    }

    /**
     * @Rest\Put("/{documentId}")
     *
     * @param                        $documentId
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function putLabeledThingInFrameAction($documentId, HttpFoundation\Request $request)
    {
        $frameNumber = $request->request->get('frameNumber');
        $shapes      = $request->request->get('shapes', []);
        $classes     = $request->request->get('classes', []);
        $incomplete  = $request->request->get('incomplete');

        if (!is_array($shapes) || !is_array($classes) || $frameNumber === null) {
            throw new Exception\BadRequestHttpException();
        }

        if ($request->request->get('rev') === null) {
            $labeledThing        = $this->labeledThingFacade->find($request->request->get('labeledThingId'));
            $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
            $labeledThingInFrame->setId($documentId);
        } else {
            if (($labeledThingInFrame = $this->labeledThingInFrameFacade->find($documentId)) === null) {
                throw new Exception\NotFoundHttpException();
            }

            if ($labeledThingInFrame->getRev() !== $request->request->get('rev')) {
                throw new Exception\ConflictHttpException();
            }

            if ($labeledThingInFrame->getFrameNumber() !== (int) $frameNumber) {
                throw new Exception\BadRequestHttpException();
            }
        }

        $labeledThingInFrame->setClasses($classes);
        $labeledThingInFrame->setShapes($shapes);
        $labeledThingInFrame->setIncomplete($incomplete);
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return View\View::create()->setData(['result' => $labeledThingInFrame]);
    }

    /**
     * @Rest\Delete("/{labeledThingInFrame}")
     *
     * @param Model\LabeledThingInFrame $documentId
     * @param HttpFoundation\Request    $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function deleteLabeledThingInFrameAction(
        Model\LabeledThingInFrame $labeledThingInFrame,
        HttpFoundation\Request $request
    ) {
        if ($labeledThingInFrame->getRev() !== $request->request->get('rev')) {
            throw new Exception\ConflictHttpException();
        }

        $this->labeledThingInFrameFacade->delete($labeledThingInFrame);

        return View\View::create()->setData(['success' => true]);
    }
}
