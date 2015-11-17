<?php

namespace AppBundle\Controller\Api;

use AppBundle\Model\Video\ImageType;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use AppBundle\Service;
use AppBundle\Model;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/labeledThingInFrame")
 * @Rest\Route(service="annostation.labeling_api.controller.api.labeled_thing_in_frame")
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
        $this->labeledThingFacade = $labeledThingFacade;
    }

    /**
     *
     * @Rest\Get("/{documentId}")
     * @param                        $documentId
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function getLabeledThingInFrameAction($documentId, HttpFoundation\Request $request)
    {
        $response            = View\View::create();
        $labeledThingInFrame = $this->labeledThingInFrameFacade->find($documentId);

        if ($labeledThingInFrame === null) {
            $response->setStatusCode(404);
            $response->setData(['result' => array('success' => false, 'msg' => 'Document not found')]);
        } else {
            $response->setData(['result' => array('success' => true, 'data' => $labeledThingInFrame)]);
        }

        return $response;
    }

    /**
     *
     * @Rest\Put("/{documentId}")
     * @param                        $documentId
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function putLabeledThingInFrameAction($documentId, HttpFoundation\Request $request)
    {
        $response = View\View::create();

        if ($request->request->get('rev') === null) {
            $labeledThing        = $this->labeledThingFacade->find(
                $request->request->get('labeledThingId')
            );
            $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
            $labeledThingInFrame->setId($documentId);
        } else {
            $labeledThingInFrame = $this->labeledThingInFrameFacade->find($documentId);
            if ($labeledThingInFrame === null) {
                $response->setStatusCode(404);

                return $response;
            }
            if ($labeledThingInFrame->getRev() !== $request->request->get('rev')) {
                $response->setStatusCode(409);

                return $response;
            }
        }

        $shapes      = $request->request->get('shapes', []);
        $classes     = $request->request->get('classes', []);
        $frameNumber = $request->request->get('frameNumber');
        $incomplete  = $request->request->get('incomplete');

        if (!is_array($shapes) || !is_array($classes) || $frameNumber === null) {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThingInFrame->setClasses($classes);
        $labeledThingInFrame->setShapes($shapes);
        $labeledThingInFrame->setFrameNumber((int)$frameNumber);
        $labeledThingInFrame->setIncomplete($incomplete);
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        $response->setData(['result' => $labeledThingInFrame]);

        return $response;
    }

    /**
     *
     * @Rest\Delete("/{documentId}")
     * @param                        $documentId
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function deleteLabeledThingInFrameAction($documentId, HttpFoundation\Request $request)
    {
        $response            = View\View::create();
        $labeledThingInFrame = $this->labeledThingInFrameFacade->find($documentId);

        if ($labeledThingInFrame === null) {
            $response->setStatusCode(404);
        } elseif ($labeledThingInFrame->getRev() === $request->request->get('rev')) {
            $this->labeledThingInFrameFacade->delete($labeledThingInFrame);
            $response->setData(['success' => true]);
        } else {
            $response->setStatusCode(409);
        }

        return $response;
    }
}
