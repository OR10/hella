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

        try {
            $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
            $labeledThingInFrame->setId($labeledThingInFrameId);
            $labeledThingInFrame->setShapes($shapes);
            $labeledThingInFrame->setClasses($classes);
            $labeledThingInFrame->setIncomplete($incomplete);
        } catch (\Exception $e) {
            throw new Exception\BadRequestHttpException();
        }

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
        $fetchLabeledThings = $request->query->getBoolean('labeledThings', true);
        $offset             = $request->query->get('offset');
        $limit              = $request->query->get('limit');

        if ($offset !== null && $limit !== null) {
            $startFrameNumber = $frameNumber + $offset;
            $endFrameNumber   = $frameNumber + $offset + $limit - 1;
        } else {
            $startFrameNumber = (int) $frameNumber;
            $endFrameNumber   = (int) $frameNumber;
        }

        $labeledThings        = [];
        $labeledThingsInFrame = $this->labelingTaskFacade->getLabeledThingsInFrameForFrameRange(
            $task,
            $startFrameNumber,
            $endFrameNumber
        );


        if ($fetchLabeledThings) {
            $labeledThingIds = array_reduce(
                $labeledThingsInFrame,
                function($labeledThingIds, $labeledThingInFrame) {
                    if (!in_array($labeledThingInFrame->getLabeledThingId(), $labeledThingIds)) {
                        $labeledThingIds[] = $labeledThingInFrame->getLabeledThingId();
                    }
                    return $labeledThingIds;
                },
                []
            );

            if (!empty($labeledThingIds)) {
                foreach ($this->labeledThingFacade->getLabeledThingsById($labeledThingIds) as $labeledThing) {
                    $labeledThings[$labeledThing->getId()] = $labeledThing;
                }
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
        $includeGhosts = $request->query->getBoolean('includeGhosts', true);
        $offset        = (int) $request->query->get('offset', 0);
        $limit         = (int) $request->query->get('limit', 1);

        if ($limit <= 0) {
            return View\View::create()->setData(['result' => []]);
        }

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $expectedFrameNumbers = range($frameNumber + $offset, $frameNumber + $offset + $limit - 1);

        if ($includeGhosts) {
            $result = $this->createLabeledThingInFrameGhosts($labeledThingsInFrame, $expectedFrameNumbers);
        } else {
            $result = array_filter(
                $labeledThingsInFrame,
                function($labeledThingInFrame) use ($expectedFrameNumbers) {
                    return in_array($labeledThingInFrame->getFrameNumber(), $expectedFrameNumbers);
                }
            );
        }

        return View\View::create()->setData(['result' => $result]);
    }

    private function createLabeledThingInFrameGhosts(array $labeledThingsInFrame, array $expectedFrameNumbers)
    {
        $labeledThingsInFrame = array_reverse($labeledThingsInFrame);

        return array_map(
            function ($expectedFrameNumber) use (&$labeledThingsInFrame) {
                reset($labeledThingsInFrame);
                while ($item = current($labeledThingsInFrame)) {
                    $currentItem = current($labeledThingsInFrame);
                    $prevItem    = prev($labeledThingsInFrame);
                    if (!$prevItem) {
                        reset($labeledThingsInFrame);
                    } else {
                        next($labeledThingsInFrame);
                    }

                    $nextItem = next($labeledThingsInFrame);
                    if (!$nextItem) {
                        $endLabeledThingInFrame = end($labeledThingsInFrame);
                    } else {
                        prev($labeledThingsInFrame);
                    }

                    if ($expectedFrameNumber === $currentItem->getFrameNumber()) {
                        return $currentItem;
                    } elseif ($expectedFrameNumber > $currentItem->getFrameNumber()) {
                        $ghostLabeledThingInFrame = $currentItem->copy($expectedFrameNumber);
                        $ghostLabeledThingInFrame->setGhost(true);

                        return $ghostLabeledThingInFrame;
                    }

                    next($labeledThingsInFrame);
                }

                $ghostLabeledThingInFrame = $endLabeledThingInFrame->copy($expectedFrameNumber);
                $ghostLabeledThingInFrame->setGhost(true);

                return $ghostLabeledThingInFrame;
            },
            $expectedFrameNumbers
        );
    }
}
