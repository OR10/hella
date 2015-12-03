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
        $this->labeledThingFacade = $labeledThingFacade;
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
        $response = View\View::create();

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
            $labeledThingInFrame = $this->labeledThingInFrameFacade->find($documentId);
            if ($labeledThingInFrame === null) {
                $response->setStatusCode(404);

                return $response;
            }
            if ($labeledThingInFrame->getRev() !== $request->request->get('rev')) {
                $response->setStatusCode(409);

                return $response;
            }

            if ($labeledThingInFrame->getFrameNumber() !== (int) $frameNumber) {
                $response->setStatusCode(400);

                return $response;
            }
        }

        $labeledThingInFrame->setClasses($classes);
        $labeledThingInFrame->setShapes($shapes);
        $labeledThingInFrame->setIncomplete($incomplete);
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        $response->setData(['result' => $labeledThingInFrame]);

        return $response;
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
        $response = View\View::create();

        if ($labeledThingInFrame->getRev() === $request->request->get('rev')) {
            $this->labeledThingInFrameFacade->delete($labeledThingInFrame);
            $response->setData(['success' => true]);
        } else {
            $response->setStatusCode(409);
        }

        return $response;
    }
}
