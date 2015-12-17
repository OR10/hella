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
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameAction(
        Model\LabeledThingInFrame $labeledThingInFrame,
        HttpFoundation\Request $request
    ) {
        return View\View::create()->setData(['result' => $labeledThingInFrame]);
    }

    /**
     * @Rest\Put("/{labeledThingInFrame}")
     *
     * @param HttpFoundation\Request         $request
     * @param Model\LabeledThingInFrame|null $labeledThingInFrame
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function putLabeledThingInFrameAction(
        HttpFoundation\Request $request,
        Model\LabeledThingInFrame $labeledThingInFrame = null
    ) {
        $labeledThingId = $request->request->get('labeledThingId');
        $frameNumber    = $request->request->get('frameNumber');
        $classes        = $request->request->get('classes', []);
        $shapes         = $request->request->get('shapes', []);

        if ($labeledThingId === null || $frameNumber === null || !is_array($classes) || !is_array($shapes)) {
            throw new Exception\BadRequestHttpException();
        }

        if ($labeledThingInFrame === null) {
            if (($labeledThing = $this->labeledThingFacade->find($labeledThingId)) === null) {
                throw new Exception\NotFoundHttpException();
            }
            try {
                $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
                $labeledThingInFrame->setId($request->attributes->get('_unresolvedLabeledThingInFrameId'));
            } catch (\Exception $e) {
                throw new Exception\BadRequestHttpException();
            }
        } else {
            if ($request->request->get('rev') !== $labeledThingInFrame->getRev()) {
                throw new Exception\ConflictHttpException();
            }

            if ($labeledThingId !== $labeledThingInFrame->getLabeledThingId()) {
                throw new Exception\BadRequestHttpException();
            }

            if ((int) $frameNumber !== $labeledThingInFrame->getFrameNumber()) {
                throw new Exception\BadRequestHttpException();
            }
        }

        $labeledThingInFrame->setClasses($classes);
        $labeledThingInFrame->setShapes($shapes);
        $labeledThingInFrame->setIncomplete($request->request->get('incomplete'));
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return View\View::create()->setData(
            ['result' =>
                [
                    'labeledThingInFrame' => $labeledThingInFrame,
                    'labeledThing' => $this->labeledThingFacade->find($labeledThingInFrame->getLabeledThingId()),
                ]
            ]
        );
    }

    /**
     * @Rest\Delete("/{labeledThingInFrame}")
     *
     * @param Model\LabeledThingInFrame $labeledThingInFrame
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

        $this->labeledThingInFrameFacade->delete(array($labeledThingInFrame));

        return View\View::create()->setData(['success' => true]);
    }
}
