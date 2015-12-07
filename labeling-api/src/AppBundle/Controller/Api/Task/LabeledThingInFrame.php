<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\View;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.labeled_thing_in_frame")
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
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
    }

    /**
     * @Rest\Post("/{task}/labeledThingInFrame/{frameNumber}")
     *
     * @param Model\LabelingTask     $task
     * @param int                    $frameNumber
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function saveLabeledThingInFrameAction(
        Model\LabelingTask $task,
        $frameNumber,
        HttpFoundation\Request $request
    ) {
        $labeledThingInFrameId = $request->request->get('id', null);
        $labeledThingId        = $request->request->get('labeledThingId');
        $shapes                = $request->request->get('shapes', []);
        $classes               = $request->request->get('classes', []);
        $incomplete            = $request->request->get('incomplete', true);
        $labeledThing          = $this->labeledThingFacade->find($labeledThingId);

        if ($labeledThing === null || !is_array($shapes) || !is_array($classes)) {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
        $labeledThingInFrame->setId($labeledThingInFrameId);
        $labeledThingInFrame->setShapes($shapes);
        $labeledThingInFrame->setClasses($classes);
        $labeledThingInFrame->setIncomplete($incomplete);

        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return View\View::create()->setData(['result' => $labeledThingInFrame]);
    }

    /**
     * @Rest\Get("/{task}/labeledThingInFrame/{frameNumber}")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     * @param int                    $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task,
        $frameNumber
    ) {
        $fetchLabeledThings = (bool) $request->query->get('labeledThings', true);

        $labeledThings        = [];
        $labeledThingsInFrame = $this->labelingTaskFacade->getLabeledThingsInFrameForFrameNumber($task, $frameNumber);

        if ($fetchLabeledThings) {
            $labeledThingIds = array_map(
                function ($labeledThingInFrame) {
                    return $labeledThingInFrame->getLabeledThingId();
                },
                $labeledThingsInFrame
            );

            foreach ($this->labeledThingFacade->getLabeledThingsById($labeledThingIds) as $labeledThing) {
                $labeledThings[$labeledThing->getId()] = $labeledThing;
            }
        }

        return View\View::create()->setData([
            'result' => [
                'labeledThings' => $labeledThings,
                'labeledThingsInFrame' => $labeledThingsInFrame,
            ]
        ]);
    }

    /**
     * Get labeled things in frame for the given frame range identified by
     * frame number, offset and limit.
     * Missing `LabeledThingInFrame`s are cloned from existing ones and marked
     * as `ghost`. Those `ghosts` have the same `frameNumber` like the
     * clone-source (for now) because of historical reasons.
     * This may change sometime.
     *
     * @Rest\Get("/{taskId}/labeledThingInFrame/{frameNumber}/{labeledThing}")
     *
     * @param string                 $taskId
     * @param                        $frameNumber
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameWithinFrameNumberAction(
        $taskId,
        $frameNumber,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        $offset = (int) $request->query->get('offset', 0);
        $limit  = (int) $request->query->get('limit', 1);

        if ($limit <= 0) {
            return View\View::create()->setData(['result' => []]);
        }

        $labeledThingInFrames = array_reverse($this->labeledThingFacade->getLabeledThingInFrames($labeledThing));
        $expectedFrameNumbers = range($frameNumber + $offset, $frameNumber + $offset + $limit - 1);

        $result = array_map(
            function ($expectedFrameNumber) use (&$labeledThingInFrames) {
                reset($labeledThingInFrames);
                while ($item = current($labeledThingInFrames)) {
                    $currentItem = current($labeledThingInFrames);
                    $prevItem    = prev($labeledThingInFrames);
                    if (!$prevItem) {
                        reset($labeledThingInFrames);
                    } else {
                        next($labeledThingInFrames);
                    }

                    $nextItem = next($labeledThingInFrames);
                    if (!$nextItem) {
                        $endLabeledThingInFrame = end($labeledThingInFrames);
                    } else {
                        prev($labeledThingInFrames);
                    }

                    if ($expectedFrameNumber === $currentItem->getFrameNumber()) {
                        return $currentItem;
                    } elseif ($expectedFrameNumber > $currentItem->getFrameNumber()) {
                        $ghostLabeledThingInFrame = clone $currentItem;
                        $ghostLabeledThingInFrame->setGhost(true);

                        return $ghostLabeledThingInFrame;
                    }

                    next($labeledThingInFrames);
                }

                $ghostLabeledThingInFrame = clone $endLabeledThingInFrame;
                $ghostLabeledThingInFrame->setGhost(true);

                return $ghostLabeledThingInFrame;
            },
            $expectedFrameNumbers
        );

        return View\View::create()->setData(['result' => $result]);
    }
}
