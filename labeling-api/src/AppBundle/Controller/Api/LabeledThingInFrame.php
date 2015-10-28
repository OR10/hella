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
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
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
        $response            = View\View::create();
        $labeledThingInFrame = $this->labeledThingInFrameFacade->find($documentId);

        if ($labeledThingInFrame === null) {
            $response->setStatusCode(404);
        } elseif ($labeledThingInFrame->getRev() === $request->request->get('rev')) {
            $labeledThingInFrame->setClasses($request->request->get('classes'));
            $labeledThingInFrame->setShapes($request->request->get('shapes'));
            $labeledThingInFrame->setFrameNumber($request->request->get('frameNumber'));
            $this->labeledThingInFrameFacade->save($labeledThingInFrame);
            $response->setData(['result' => $labeledThingInFrame]);
        } else {
            $response->setStatusCode(409);
        }

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
            $response->setData(['result' => array('success' => false, 'msg' => 'Document not found')]);
        } elseif ($labeledThingInFrame->getRev() === $request->request->get('rev')) {
            $this->labeledThingInFrameFacade->delete($labeledThingInFrame);
            $response->setData(['result' => array('success' => true)]);
        } else {
            $response->setStatusCode(409);
            $response->setData(['result' => array('success' => false, 'msg' => 'Document conflict')]);
        }

        return $response;
    }
}