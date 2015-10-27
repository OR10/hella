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
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     */
    function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
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
        $labeledThingInFrame = $this->addLabeledThingAndLabeledThingInFrame(
            $taskId,
            $frameNumber,
            $request->request->get('shapes'),
            $request->request->get('classes')
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

        $response->setData(['result' => $labeledThingsInFrames]);

        return $response;
    }

    /**
     * @param $taskId
     * @param $frameNumber
     * @param $shapes
     * @param $classes
     *
     * @return Model\LabeledThingInFrame
     */
    private function addLabeledThingAndLabeledThingInFrame(
        $taskId,
        $frameNumber,
        $shapes,
        $classes
    ) {
        $labeledThing = new Model\LabeledThing($taskId);
        $this->labeledThingFacade->save($labeledThing);

        $thingInFrame = new Model\LabeledThingInFrame($labeledThing->getId());

        $thingInFrame->setFrameNumber(
            $frameNumber
        );
        $thingInFrame->setShapes(
            $shapes
        );
        $thingInFrame->setClasses(
            $classes
        );

        $this->labeledThingInFrameFacade->save($thingInFrame);

        return $thingInFrame;
    }
}