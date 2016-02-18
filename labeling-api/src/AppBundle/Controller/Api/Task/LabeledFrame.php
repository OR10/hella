<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
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
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * @param Facade\LabeledFrame $labeledFrameFacade
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Service\TaskIncomplete $taskIncompleteService
     * @internal param Facade\LabeledFrame $labeledFrame
     * @internal param Facade\LabelingTask $labelingTask
     */
    public function __construct(
        Facade\LabeledFrame $labeledFrameFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\TaskIncomplete $taskIncompleteService
    ){
        $this->labeledFrameFacade = $labeledFrameFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->taskIncompleteService = $taskIncompleteService;
    }

    /**
     * @Rest\Get("/{task}/labeledFrame/{frameNumber}")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     * @param int                    $frameNumber
     *
     * @return View\View
     */
    public function getLabeledFrameAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task,
        $frameNumber
    ) {
        $frameNumber  = (int) $frameNumber;
        $offset       = $request->query->get('offset');
        $limit        = $request->query->get('limit');

        $labeledFrame = $this->labelingTaskFacade->getCurrentOrPreceedingLabeledFrame($task, $frameNumber);

        if ($labeledFrame === null) {
            $labeledFrame = new Model\LabeledFrame($task, $frameNumber);
        } elseif ($labeledFrame->getFrameNumber() !== $frameNumber) {
            $labeledFrame = $labeledFrame->copyToFrameNumber($frameNumber);
        }

        if ($offset !== null && $limit !== null) {
            $labeledFrames = $this->labelingTaskFacade->getLabeledFrames(
                $task,
                $frameNumber + $offset + 1,
                $frameNumber + $offset + $limit - 1
            );

            $result = [];

            foreach (range($frameNumber + $offset, $frameNumber + $offset + $limit - 1) as $frameNumber) {
                if (!empty($labeledFrames) && $labeledFrames[0]->getFrameNumber() <= $frameNumber) {
                    $labeledFrame = array_shift($labeledFrames);
                }

                if ($frameNumber != $labeledFrame->getFrameNumber()) {
                    $result[] = $labeledFrame->copyToFrameNumber($frameNumber);
                } else {
                    $result[] = $labeledFrame;
                }
            }

            return View\View::create()->setData(['result' => $result]);
        } else {
            return View\View::create()->setData(['result' => $labeledFrame]);
        }
    }

    /**
     * @Rest\Delete("/{task}/labeledFrame/{frameNumber}")
     * @ForbidReadonlyTasks
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
        if (($labeledFrame = $this->labelingTaskFacade->getLabeledFrame($task, $frameNumber)) === null) {
            throw new Exception\NotFoundHttpException('LabeledFrame not found');
        }

        $this->labeledFrameFacade->delete($labeledFrame);

        return View\View::create()->setData(['success' => true]);
    }

    /**
     *
     * @Rest\Put("/{task}/labeledFrame/{frameNumber}")
     * @ForbidReadonlyTasks
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
        $labeledFrameId  = $request->request->get('id');
        $revision        = $request->request->get('rev');
        $bodyFrameNumber = (int) $request->request->get('frameNumber');
        $classes         = $request->request->get('classes', []);

        if (!is_array($classes) || $bodyFrameNumber !== (int) $frameNumber || $labeledFrameId === null) {
            throw new Exception\BadRequestHttpException('Missing classes, labeledFrameId or invalid bodyFrameNumber');
        }

        if (($labeledFrame = $this->labelingTaskFacade->getLabeledFrame($task, $frameNumber)) === null) {
            $labeledFrame = new Model\LabeledFrame($task, $frameNumber);
            $labeledFrame->setId($labeledFrameId);
        } elseif ($labeledFrame->getRev() !== $revision) {
            // TODO: Synchronize with frontend team to find a better solution here!
            //throw new Exception\ConflictHttpException();
        }

        // I'm not quite sure about changing the id but since we are requesting
        // the labeledFrame by task and frameNumber, the id might be able to
        // change.
        // Maybe it's better to throw an exception in this case.
        if ($labeledFrame->getId() !== $labeledFrameId) {
            $labeledFrame->setId($labeledFrameId);
        }

        $labeledFrame->setClasses($classes);
        $labeledFrame->setIncomplete(
            $this->taskIncompleteService->isLabeledFrameIncomplete($labeledFrame)
        );

        $this->labeledFrameFacade->save($labeledFrame);

        return View\View::create()->setData(['result' => $labeledFrame]);
    }
}
