<?php

namespace AppBundle\Controller\Api\Task;

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

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.labeled_frame")
 *
 * @CloseSession
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
     * @Rest\Get("/{task}/labeledFrame/{frameNumber}")
     *
     * @param Model\LabelingTask $task
     * @param int                $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     * @internal param $documentId
     *
     */
    public function getLabeledFrameAction(Model\LabelingTask $task, $frameNumber)
    {
        $response = View\View::create();

        $labeledFrame = $this->getDocumentByTaskAndFrameNumber($task, $frameNumber);

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
     * @Rest\Delete("/{task}/labeledFrame/{frameNumber}")
     *
     * @param Model\LabelingTask $task
     * @param int                $frameNumber
     *
     * @return \FOS\RestBundle\View\View
     * @internal param $documentId
     *
     */
    public function deleteLabeledFrameAction(Model\LabelingTask $task, $frameNumber)
    {
        if (($labeledFrame = $this->getDocumentByTaskAndFrameNumber($task, $frameNumber)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        $this->labeledFrameFacade->delete($labeledFrame);

        return View\View::create()->setData(['success' => true]);
    }

    /**
     *
     * @Rest\Put("/{task}/labeledFrame/{frameNumber}")
     *
     * @param Model\LabelingTask     $task
     * @param int                    $frameNumber
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     *
     * @internal param HttpFoundation\Request $request
     */
    public function putLabeledThingInFrameAction(
        Model\LabelingTask $task,
        $frameNumber,
        HttpFoundation\Request $request
    ) {
        $response = View\View::create();

        $classes         = $request->request->get('classes', []);
        $bodyFrameNumber = (int) $request->request->get('frameNumber');
        $incomplete      = $request->request->get('incomplete');
        $documentId      = $request->request->get('id');

        if (!is_array($classes) || $bodyFrameNumber !== (int) $frameNumber || $documentId === null) {
            throw new Exception\BadRequestHttpException();
        }

        if ($request->request->get('rev') === null) {
            $labeledFrame = new Model\LabeledFrame($task);
            $labeledFrame->setId($documentId);
        } else {
            $labeledFrame = $this->getDocumentByTaskAndFrameNumber($task, $frameNumber);
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
    private function getDocumentByTaskAndFrameNumber(Model\LabelingTask $task, $frameNumber)
    {
        $labeledFrames = $this->labelingTaskFacade->getLabeledFrames($task, $frameNumber, $frameNumber)->toArray();

        if (count($labeledFrames) === 0) {
            return null;
        }

        return $labeledFrames[0];
    }
}
