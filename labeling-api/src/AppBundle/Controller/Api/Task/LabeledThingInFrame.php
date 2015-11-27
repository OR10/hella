<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\View;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use Doctrine\ODM\CouchDB;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.labeled_thing_in_frame")
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
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param CouchDB\DocumentManager    $documentManager
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade,
        CouchDB\DocumentManager $documentManager
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->documentManager           = $documentManager;
    }

    /**
     * @Rest\Post("/{task}/labeledThingInFrame/{frameNumber}")
     *
     * @param Model\LabelingTask     $task
     * @param                        $frameNumber
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function saveLabeledThingInFrameAction(
        Model\LabelingTask $task,
        $frameNumber,
        HttpFoundation\Request $request
    ) {
        $response = View\View::create();

        $shapes         = $request->request->get('shapes', []);
        $classes        = $request->request->get('classes', []);
        $incomplete     = $request->request->get('incomplete', true);
        $documentId     = $request->request->get('id', null);
        $labeledThingId = $request->request->get('labeledThingId');
        $labeledThing   = $this->labeledThingFacade->find($labeledThingId);

        // FIXME: !is_array([$classes])
        if (!is_array($shapes) || !is_array([$classes]) || $labeledThing === null) {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThingInFrame = $this->addLabeledThingAndLabeledThingInFrame(
            $task,
            $labeledThing,
            $documentId,
            $frameNumber,
            $shapes,
            $classes,
            $incomplete
        );

        $response->setData(['result' => $labeledThingInFrame]);

        return $response;
    }

    /**
     * @Rest\Get("/{task}/labeledThingInFrame/{frameNumber}")
     *
     * @param Model\LabelingTask $taskId
     * @param int                $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameAction(Model\LabelingTask $task, $frameNumber)
    {
        $response = View\View::create();

        $labeledThings         = $this->labelingTaskFacade->getLabeledThings($task);
        $labeledThingsInFrames = array();
        foreach ($labeledThings as $labeledThing) {
            foreach ($this->labeledThingFacade->getLabeledThingInFrames($labeledThing, $frameNumber, 0, 1) as $labeledThingInFrame) {
                $labeledThingsInFrames[] = $labeledThingInFrame;
            }
        }

        $labeledThingsInFrames = array_filter(
            $labeledThingsInFrames,
            function ($labeledThingInFrame) use ($frameNumber) {
                return ($labeledThingInFrame->getFrameNumber() === (int) $frameNumber);
            }
        );

        $response->setData(['result' => array_values($labeledThingsInFrames)]);

        return $response;
    }


    /**
     * @Rest\Get("/{task}/labeledThingInFrame/{frameNumber}/{labeledThing}")
     *
     * @param Model\LabelingTask     $task
     * @param                        $frameNumber
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameWithinFrameNumberAction(
        Model\LabelingTask $task,
        $frameNumber,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        $offset = (int) $request->query->get('offset', 0);
        $limit  = (int) $request->query->get('limit', 1);

        if ($limit <= 0) {
            return View\View::create()->setData(['result' => []]);
        }

        $labeledThingInFrames =$this->labeledThingFacade->getLabeledThingInFrames($labeledThing)->toArray();
        $expectedFrameNumbers = range($frameNumber + $offset, $frameNumber + $offset + $limit - 1);

        $result = array_map(function ($expectedFrameNumber) use (&$labeledThingInFrames) {
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
        }, $expectedFrameNumbers);

        return View\View::create()->setData(['result' => $result]);
    }

    /**
     * @param Model\LabelingTask $task
     * @param Model\LabeledThing $labeledThing
     * @param string|null        $id
     * @param int                $frameNumber
     * @param mixed[]            $shapes
     * @param mixed[]            $classes
     * @param boolean            $incomplete
     *
     * @return Model\LabeledThingInFrame
     */
    private function addLabeledThingAndLabeledThingInFrame(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing,
        $id,
        $frameNumber,
        $shapes,
        $classes,
        $incomplete
    ) {
        $thingInFrame = new Model\LabeledThingInFrame($labeledThing);

        if ($id !== null) {
            $thingInFrame->setId($id);
        }

        $thingInFrame->setFrameNumber($frameNumber);
        $thingInFrame->setShapes($shapes);
        $thingInFrame->setClasses($classes);
        $thingInFrame->setIncomplete($incomplete);

        $this->labeledThingInFrameFacade->save($thingInFrame);

        return $thingInFrame;
    }
}
