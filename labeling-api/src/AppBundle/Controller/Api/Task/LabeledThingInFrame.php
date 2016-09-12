<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
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
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagationService;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @param Facade\LabeledThingInFrame      $labeledThingInFrameFacade
     * @param Facade\LabeledThing             $labeledThingFacade
     * @param Facade\LabelingTask             $labelingTaskFacade
     * @param Service\GhostClassesPropagation $ghostClassesPropagationService
     * @param Service\Authorization           $authorizationService
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\GhostClassesPropagation $ghostClassesPropagationService,
        Service\Authorization $authorizationService
    ) {
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->ghostClassesPropagationService = $ghostClassesPropagationService;
        $this->authorizationService           = $authorizationService;
    }

    /**
     * @Rest\Post("/{task}/labeledThingInFrame/{frameIndex}")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask     $task
     * @param int                    $frameIndex
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function saveLabeledThingInFrameAction(
        Model\LabelingTask $task,
        $frameIndex,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        $labeledThingInFrameId = $request->request->get('id', null);
        $labeledThingId        = $request->request->get('labeledThingId');
        $shapes                = $request->request->get('shapes', []);
        $classes               = $request->request->get('classes', []);
        $incomplete            = $request->request->get('incomplete', true);
        $labeledThing          = $this->labeledThingFacade->find($labeledThingId);

        if ($labeledThing === null || !is_array($shapes) || !is_array($classes)) {
            throw new Exception\BadRequestHttpException('Missing labeledThing, shapes or classes');
        }

        try {
            $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameIndex);
            $labeledThingInFrame->setId($labeledThingInFrameId);
            $labeledThingInFrame->setShapes($shapes);
            $labeledThingInFrame->setClasses(
                array_merge(
                    $classes,
                    $task->getPredefinedClasses()
                )
            );
            $labeledThingInFrame->setIncomplete($incomplete);
        } catch (\Exception $e) {
            throw new Exception\BadRequestHttpException('Failed to create a new LabeledThingInFrame');
        }

        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return View\View::create()->setData(['result' => $labeledThingInFrame]);
    }

    /**
     * @Rest\Get("/{task}/labeledThingInFrame")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task
    ) {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        $limit = $request->query->getInt('limit', 0);

        if ($request->query->get('incompleteOnly', false) === 'true') {
            $labeledThingInFrame = $this->labeledThingInFrameFacade->getIncompleteLabeledThingsInFrame($task, $limit);
        } else {
            $labeledThingInFrame = $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task, $limit);
        }

        return View\View::create()->setData(['result' => $labeledThingInFrame]);
    }

    /**
     * @Rest\Get("/{task}/labeledThingInFrame/{frameIndex}")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     * @param int                    $frameIndex
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameForFrameAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task,
        $frameIndex
    ) {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        $fetchLabeledThings = $request->query->getBoolean('labeledThings', true);
        $offset             = $request->query->get('offset');
        $limit              = $request->query->get('limit');

        if ($offset !== null && $limit !== null) {
            $startFrameIndex = $frameIndex + $offset;
            $endFrameIndex   = $frameIndex + $offset + $limit - 1;
        } else {
            $startFrameIndex = (int) $frameIndex;
            $endFrameIndex   = (int) $frameIndex;
        }

        $labeledThings        = [];
        $labeledThingsInFrame = $this->labelingTaskFacade->getLabeledThingsInFrameForFrameRange(
            $task,
            $startFrameIndex,
            $endFrameIndex
        );

        if ($fetchLabeledThings) {
            $labeledThingIds = array_reduce(
                $labeledThingsInFrame,
                function ($labeledThingIds, $labeledThingInFrame) {
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

        $labeledThingsInFrameWithGhostClasses = $this->ghostClassesPropagationService->propagateGhostClasses(
            $labeledThingsInFrame
        );

        return View\View::create()->setData(
            [
                'result' => [
                    'labeledThings'        => $labeledThings,
                    'labeledThingsInFrame' => $labeledThingsInFrameWithGhostClasses,
                ],
            ]
        );
    }

    /**
     * Get labeled things in frame for the given frame range identified by
     * frame number, offset and limit.
     * Missing `LabeledThingInFrame`s are cloned from existing ones and marked
     * as `ghost`. Those `ghosts` have the same `frameIndex` like the
     * clone-source (for now) because of historical reasons.
     * This may change sometime.
     *
     * @Rest\Get("/{task}/labeledThingInFrame/{frameIndex}/{labeledThing}")
     *
     * @param Model\LabelingTask     $task
     * @param int                    $frameIndex
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameWithinFrameIndexAction(
        Model\LabelingTask $task,
        $frameIndex,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        $includeGhosts = $request->query->getBoolean('includeGhosts', true);
        $offset        = (int) $request->query->get('offset', 0);
        $limit         = (int) $request->query->get('limit', 1);

        if ($limit <= 0) {
            return View\View::create()->setData(['result' => []]);
        }

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $expectedFrameIndexes = range($frameIndex + $offset, $frameIndex + $offset + $limit - 1);

        $labeledThingsInFrameWithinRangeWithGhosts = array();
        if (!empty($labeledThingsInFrame)) {
            if ($includeGhosts) {
                $labeledThingsInFrameWithinRangeWithGhosts = $this->createLabeledThingInFrameGhosts(
                    $labeledThingsInFrame,
                    $expectedFrameIndexes
                );
            } else {
                $labeledThingsInFrameWithinRangeWithGhosts = array_filter(
                    $labeledThingsInFrame,
                    function ($labeledThingInFrame) use ($expectedFrameIndexes) {
                        return in_array($labeledThingInFrame->getFrameIndex(), $expectedFrameIndexes);
                    }
                );
            }
        }

        // @TODO: May be optimized as we already fetched a list of all LabeledThingsInFrame before
        //        Therefore a refetch of the one needed for ghost class calculation is not really needed here
        $labeledThingsInFrameWithinRangeWithGhostsAndGhostClasses = $this->ghostClassesPropagationService->propagateGhostClasses(
            $labeledThingsInFrameWithinRangeWithGhosts
        );

        return View\View::create()->setData(['result' => $labeledThingsInFrameWithinRangeWithGhostsAndGhostClasses]);
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrame
     * @param int[]                       $expectedFrameIndexes
     *
     * @return Model\LabeledThingInFrame[]
     */
    private function createLabeledThingInFrameGhosts(array $labeledThingsInFrame, array $expectedFrameIndexes)
    {
        $labeledThingsInFrame = array_reverse($labeledThingsInFrame);

        return array_map(
            function ($expectedFrameIndex) use (&$labeledThingsInFrame) {
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

                    if ($expectedFrameIndex === $currentItem->getFrameIndex()) {
                        return $currentItem;
                    } elseif ($expectedFrameIndex > $currentItem->getFrameIndex()) {
                        $ghostLabeledThingInFrame = $currentItem->copy($expectedFrameIndex);
                        $ghostLabeledThingInFrame->setGhost(true);
                        $ghostLabeledThingInFrame->setGhostClasses($ghostLabeledThingInFrame->getClasses());
                        $ghostLabeledThingInFrame->setClasses(array());

                        return $ghostLabeledThingInFrame;
                    }

                    next($labeledThingsInFrame);
                }

                $ghostLabeledThingInFrame = $endLabeledThingInFrame->copy($expectedFrameIndex);
                $ghostLabeledThingInFrame->setGhost(true);
                $ghostLabeledThingInFrame->setGhostClasses($ghostLabeledThingInFrame->getClasses());
                $ghostLabeledThingInFrame->setClasses(array());

                return $ghostLabeledThingInFrame;
            },
            $expectedFrameIndexes
        );
    }
}
