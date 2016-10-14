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
use crosscan\Logger\Facade\LoggerFacade;

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
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LoggerFacade
     */
    private $logger;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Service\TaskIncomplete     $taskIncompleteService
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param \cscntLogger               $logger
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        Service\TaskIncomplete $taskIncompleteService,
        Facade\LabelingTask $labelingTaskFacade,
        \cscntLogger $logger
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->taskIncompleteService     = $taskIncompleteService;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->logger                    = new LoggerFacade($logger, self::class);
    }

    /**
     * @Rest\Get("/{labeledThingInFrame}")
     *
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param HttpFoundation\Request    $request
     *
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

        //@TODO This is a temp check only, this should be fixed
        if (count($shapes) !== 1) {
            throw new Exception\BadRequestHttpException('Invalid number of shapes');
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
                $this->logger->logString(
                    sprintf(
                        '[Update Conflict] LabeledThingInFrame (%s) rev. (%s) does not match current rev. (%s) for task %s',
                        $labeledThingInFrame->getId(),
                        $request->request->get('rev'),
                        $labeledThingInFrame->getRev(),
                        $labeledThing->getTaskId()
                    ),
                    \cscntLogPayload::SEVERITY_WARNING
                );
                throw new Exception\ConflictHttpException('Revision mismatch');
            }

            if ($labeledThingId !== $labeledThingInFrame->getLabeledThingId()) {
                throw new Exception\BadRequestHttpException(
                    'LabeledThingId did not match with the labeledThingInFrame thingId'
                );
            }

            if ((int) $frameIndex !== $labeledThingInFrame->getFrameIndex()) {
                throw new Exception\BadRequestHttpException(
                    'FrameIndex did not match with the labeledThingInFrame FrameIndex'
                );
            }
        }

        $task = $this->labelingTaskFacade->find($labeledThing->getTaskId());

        $labeledThingInFrame->setClasses(
            array_merge(
                $classes,
                $task->getPredefinedClasses()
            )
        );

        // Check if the shapes are valid
        try {
            foreach ($shapes as $shape) {
                Model\Shape::createFromArray($shape);
            }
        } catch (\Exception $e) {
            throw new Exception\BadRequestHttpException($e->getMessage());
        }
        $labeledThingInFrame->setShapes($shapes);

        $incompleteBefore = $labeledThingInFrame->getIncomplete();

        $labeledThingInFrame->setIncomplete(
            $this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame)
        );

        if ($incompleteBefore !== $labeledThingInFrame->getIncomplete()) {
            $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus(
                $labeledThing,
                $labeledThingInFrame
            );
        }

        $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        $labeledThing->setIncomplete(
            $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
        );
        $this->labeledThingFacade->save($labeledThing);

        if (empty($labeledThingInFrame->getClasses())) {
            $previousClasses = $this->labeledThingInFrameFacade->getPreviousLabeledThingInFrameWithClasses(
                $labeledThingInFrame
            );
            if ($previousClasses instanceof Model\LabeledThingInFrame) {
                $labeledThingInFrame->setGhostClasses($previousClasses->getClasses());
            }
        }

        return View\View::create()->setData(
            [
                'result' =>
                    [
                        'labeledThingInFrame' => $labeledThingInFrame,
                        'labeledThing'        => $this->labeledThingFacade->find(
                            $labeledThingInFrame->getLabeledThingId()
                        ),
                    ],
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
