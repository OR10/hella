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
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing $labeledThingFacade
     * @param Service\TaskIncomplete $taskIncompleteService
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        Service\TaskIncomplete $taskIncompleteService
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->taskIncompleteService     = $taskIncompleteService;
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
        $frameIndex     = $request->request->get('frameIndex');
        $classes        = $request->request->get('classes', []);
        $shapes         = $request->request->get('shapes', []);

        if ($labeledThingId === null || $frameIndex === null || !is_array($classes) || !is_array($shapes)) {
            throw new Exception\BadRequestHttpException('Missing labeledThingId, frameIndex, classes or shapes');
        }

        $labeledThing = $this->labeledThingFacade->find($labeledThingId);
        if ($labeledThingInFrame === null) {
            if ($labeledThing === null) {
                throw new Exception\NotFoundHttpException('LabeledThing ' . $labeledThingId . ' not found');
            }
            if (count($this->labeledThingFacade->getLabeledThingInFrames($labeledThing, $frameIndex)) > 0) {
                throw new Exception\BadRequestHttpException('Duplicate LabeledThingInFrame for this LabeledThing');
            }
            try {
                $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameIndex);
                $labeledThingInFrame->setId($request->attributes->get('_unresolvedLabeledThingInFrameId'));
            } catch (\Exception $e) {
                throw new Exception\BadRequestHttpException('Failed to create a new LabeledThingInFrame.');
            }
        } else {
            if ($request->request->get('rev') !== $labeledThingInFrame->getRev()) {
                throw new Exception\ConflictHttpException('Revision mismatch');
            }

            if ($labeledThingId !== $labeledThingInFrame->getLabeledThingId()) {
                throw new Exception\BadRequestHttpException('LabeledThingId did not match with the labeledThingInFrame thingId');
            }

            if ((int) $frameIndex !== $labeledThingInFrame->getFrameIndex()) {
                throw new Exception\BadRequestHttpException('FrameIndex did not match with the labeledThingInFrame FrameIndex');
            }
        }

        $labeledThingInFrame->setClasses($classes);
        $labeledThingInFrame->setShapes($shapes);

        $incompleteBefore = $labeledThingInFrame->getIncomplete();

        $labeledThingInFrame->setIncomplete(
            $this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame)
        );

        if ($incompleteBefore !== $labeledThingInFrame->getIncomplete()) {
            $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus($labeledThing, $labeledThingInFrame);
        }

        $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        $labeledThing->setIncomplete(
            $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
        );
        $this->labeledThingFacade->save($labeledThing);

        if (empty($labeledThingInFrame->getClasses())) {
            $previousClasses = $this->labeledThingInFrameFacade->getPreviousLabeledThingInFrameWithClasses($labeledThingInFrame);
            if ($previousClasses instanceof Model\LabeledThingInFrame) {
                $labeledThingInFrame->setGhostClasses($previousClasses->getClasses());
            }
        }

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
            throw new Exception\ConflictHttpException('Revision mismatch');
        }

        $this->labeledThingInFrameFacade->delete(array($labeledThingInFrame));

        return View\View::create()->setData(['success' => true]);
    }
}
