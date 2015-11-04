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
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.labeled_frame")
 */
class LabeledFrame extends Controller\Base
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\LabeledFrame $labeledFrame
     * @param Facade\LabelingTask $labelingTask
     */
    public function __construct(Facade\LabeledFrame $labeledFrame, Facade\LabelingTask $labelingTask)
    {
        $this->labeledFrameFacade = $labeledFrame;
        $this->labelingTaskFacade = $labelingTask;
    }

    /**
     * @Rest\Get("/{taskId}/labeledFrame/{frameNumber}")
     *
     * @param $taskId
     * @param $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     * @internal param $documentId
     *
     */
    public function getLabeledFrameAction($taskId, $frameNumber)
    {
        $response = View\View::create();

        $task = $this->labelingTaskFacade->find($taskId);
        if ($task === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $labeledFrame = $this->getDocumentByTaskIdAndFrameNumber($task, $frameNumber);

        if ($labeledFrame === null) {
            $labeledFrames = $this->labelingTaskFacade->getLabeledFrames($task, 0, $frameNumber)->toArray();

            if (count($labeledFrames) === 0) {
                $response->setStatusCode(404);

                return $response;
            }

            usort($labeledFrames, function ($a, $b) {
                return (int)$b->getFrameNumber() - (int)$a->getFrameNumber();
            });
            $response->setData(['result' => $labeledFrames[0]]);
        } else {
            $response->setData(['result' => $labeledFrame]);
        }

        return $response;
    }

    /**
     * @Rest\Delete("/{taskId}/labeledFrame/{frameNumber}")
     *
     * @param $taskId
     * @param $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     * @internal param $documentId
     *
     */
    public function deleteLabeledFrameAction($taskId, $frameNumber)
    {
        $response = View\View::create();

        $task         = $this->labelingTaskFacade->find($taskId);
        $labeledFrame = $this->getDocumentByTaskIdAndFrameNumber($task, $frameNumber);
        if ($task === null || $labeledFrame === null) {
            $response->setStatusCode(404);

            return $response;
        }
        $this->labeledFrameFacade->delete($labeledFrame);
        $response->setData(['success' => true]);

        return $response;

    }

    /**
     *
     * @Rest\Put("/{taskId}/labeledFrame/{frameNumber}")
     *
     * @param                        $taskId
     * @param                        $frameNumber
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     * @internal param HttpFoundation\Request $request
     */
    public function putLabeledThingInFrameAction($taskId, $frameNumber, HttpFoundation\Request $request)
    {
        $response = View\View::create();

        $task = $this->labelingTaskFacade->find($taskId);
        if ($task === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $labeledFrame = $this->getDocumentByTaskIdAndFrameNumber($task, $frameNumber);

        if ($labeledFrame instanceof Model\LabeledFrame && $labeledFrame->getRev() !== $request->request->get('rev')) {
            $response->setStatusCode(409);
        } else {
            if ($labeledFrame === null) {
                $labeledFrame = new Model\LabeledFrame($task);
            }
            $labeledFrame->setClasses(
                $request->request->get('classes') === null ? array() : $request->request->get('classes')
            );
            $labeledFrame->setFrameNumber($request->request->get('frameNumber'));
            $this->labeledFrameFacade->save($labeledFrame);
            $response->setData(['result' => $labeledFrame]);
        }

        return $response;
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $frameNumber
     * @return null|Model\LabeledFrame
     */
    private function getDocumentByTaskIdAndFrameNumber(Model\LabelingTask $task, $frameNumber)
    {
        $labeledFrames = $this->labelingTaskFacade->getLabeledFrames($task, $frameNumber, $frameNumber)->toArray();

        if (count($labeledFrames) === 0) {
            return null;
        }

        return $labeledFrames[0];
    }
}
