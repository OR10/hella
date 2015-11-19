<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Model\Video\ImageType;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use AppBundle\Service;
use AppBundle\Model;
use Symfony\Component\HttpKernel\Exception;
use Doctrine\ODM\CouchDB;

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
     *
     * @Rest\Post("/{taskId}/labeledThingInFrame/{frameNumber}")
     * @param                        $taskId
     * @param                        $frameNumber
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function saveLabeledThingInFrameAction($taskId, $frameNumber, HttpFoundation\Request $request)
    {
        $response = View\View::create();
        $task     = $this->labelingTaskFacade->find($taskId);

        if ($task === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $shapes         = $request->request->get('shapes', []);
        $classes        = $request->request->get('classes', []);
        $incomplete     = $request->request->get('incomplete', true);
        $documentId     = $request->request->get('id');
        $labeledThingId = $request->request->get('labeledThingId');
        $labeledThing   = $this->labeledThingFacade->find($labeledThingId);

        if (!is_array($shapes) || !is_array([$classes]) || $labeledThing === null) {
            throw new Exception\BadRequestHttpException();
        }

        if ($documentId === null) {
            $uuids      = $this->documentManager->getCouchDBClient()->getUuids();
            $documentId = reset($uuids);
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
     *
     * @Rest\Get("/{taskId}/labeledThingInFrame/{frameNumber}")
     * @param $taskId
     * @param $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     *
     */
    public function getLabeledThingInFrameAction($taskId, $frameNumber)
    {
        $response = View\View::create();
        $task     = $this->labelingTaskFacade->find($taskId);

        if ($task === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $labeledThings         = $this->labelingTaskFacade->getLabeledThings($task);
        $labeledThingsInFrames = array();
        foreach ($labeledThings as $labeledThing) {
            foreach ($this->labeledThingFacade->getLabeledThingInFrames($labeledThing) as $labeledThingInFrame) {
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
     *
     * @Rest\Get("/{taskId}/labeledThingInFrame/{frameNumber}/{labeledThingId}")
     * @param                        $taskId
     * @param                        $frameNumber
     * @param                        $labeledThingId
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingInFrameWithinFrameNumberAction($taskId, $frameNumber, $labeledThingId, HttpFoundation\Request $request)
    {
        $response = View\View::create();

        $labeledThing = $this->labeledThingFacade->find($labeledThingId);

        if ($labeledThing === null) {
            throw new Exception\NotFoundHttpException();
        }

        $offset = $request->query->get('offset', null);
        $limit  = $request->query->get('limit', null);

        $labeledThingInFrames = array_reverse($this->labeledThingFacade->getLabeledThingInFrames($labeledThing)->toArray());
        $expectedFrameNumbers = range($frameNumber + $offset, ($frameNumber + $offset) + $limit);

        $result = array_map(function ($expectedFrameNumber) use ($labeledThingInFrames) {
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
                    $ghostLabeledThingInFrame = new Model\LabeledThingInFrame();
                    $ghostLabeledThingInFrame->setGhost(true);
                    $ghostLabeledThingInFrame->setLabeledThingId($currentItem->getLabeledThingId());
                    $ghostLabeledThingInFrame->setFrameNumber($expectedFrameNumber);
                    $ghostLabeledThingInFrame->setShapes($currentItem->getShapes());

                    return $ghostLabeledThingInFrame;
                }

                next($labeledThingInFrames);
            }

            $ghostLabeledThingInFrame = new Model\LabeledThingInFrame();
            $ghostLabeledThingInFrame->setGhost(true);
            $ghostLabeledThingInFrame->setLabeledThingId($endLabeledThingInFrame->getLabeledThingId());
            $ghostLabeledThingInFrame->setFrameNumber($expectedFrameNumber);
            $ghostLabeledThingInFrame->setShapes($endLabeledThingInFrame->getShapes());

            return $ghostLabeledThingInFrame;
        }, $expectedFrameNumbers);

        $response->setData(['result' => $result]);

        return $response;
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $id
     * @param                    $frameNumber
     * @param                    $shapes
     * @param                    $classes
     * @param                    $incomplete
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

        $thingInFrame->setId($id);

        $thingInFrame->setFrameNumber(
            $frameNumber
        );
        $thingInFrame->setShapes(
            $shapes
        );
        $thingInFrame->setClasses(
            $classes
        );
        $thingInFrame->setIncomplete(
            $incomplete
        );

        $this->labeledThingInFrameFacade->save($thingInFrame);

        return $thingInFrame;
    }
}
