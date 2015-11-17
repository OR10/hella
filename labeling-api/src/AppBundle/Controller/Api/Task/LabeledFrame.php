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
                $response->setData([
                    'result' => array(
                        'frameNumber' => (int) $frameNumber,
                        'classes' => array(),
                    )
                ]);

                return $response;
            }

            usort($labeledFrames, function ($a, $b) {
                return (int)$b->getFrameNumber() - (int)$a->getFrameNumber();
            });
            $foundLabeledFrame = $labeledFrames[0];
            $response->setData([
                'result' => [
                    'frameNumber' => $frameNumber,
                    'classes' => $foundLabeledFrame->getClasses(),
                ]
           ]);
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

        $task = $this->labelingTaskFacade->find($taskId);
        if ($task === null) {
            $response->setStatusCode(404);

            return $response;
        }
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

        $task            = $this->labelingTaskFacade->find($taskId);
        $classes         = $request->request->get('classes', []);
        $bodyFrameNumber = (int) $request->request->get('frameNumber');
        $incomplete      = $request->request->get('incomplete');
        $documentId      = $request->request->get('id');

        if ($task === null || !is_array($classes) || $bodyFrameNumber !== (int) $frameNumber || $documentId === null) {
            throw new Exception\BadRequestHttpException();
        }

        if ($request->request->get('rev') === null) {
            $labeledFrame = new Model\LabeledFrame($task);
            $labeledFrame->setId(
                $documentId
            );
        }else{
            $labeledFrame = $this->getDocumentByTaskIdAndFrameNumber($task, $frameNumber);
        }


        // @TODO: Synchronize with frontend team, to find a better solution
        // here!
        //if ($labeledFrame instanceof Model\LabeledFrame && $labeledFrame->getRev() !== $request->request->get('rev')) {
        //      $response->setStatusCode(409);
        //} else {
            $labeledFrame->setClasses($classes);
            $labeledFrame->setFrameNumber($request->request->get('frameNumber'));
            $labeledFrame->setIncomplete($incomplete);
            $this->labeledFrameFacade->save($labeledFrame);
            $response->setData(['result' => $labeledFrame]);
        //}

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
