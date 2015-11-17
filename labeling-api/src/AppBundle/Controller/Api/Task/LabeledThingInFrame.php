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

        $shapes     = $request->request->get('shapes', []);
        $classes    = $request->request->get('classes', []);
        $incomplete = $request->request->get('incomplete', true);
        $documentId = $request->request->get('id');

        if (!is_array($shapes) || !is_array([$classes])) {
            throw new Exception\BadRequestHttpException();
        }

        if ($documentId === null) {
            $documentId = reset($this->documentManager->getCouchDBClient()->getUuids());
        }

        $labeledThingInFrame = $this->addLabeledThingAndLabeledThingInFrame(
            $task,
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
     * @internal param HttpFoundation\Request $request
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
        $id,
        $frameNumber,
        $shapes,
        $classes,
        $incomplete
    ) {
        $labeledThing = new Model\LabeledThing($task);
        $this->labeledThingFacade->save($labeledThing);

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
