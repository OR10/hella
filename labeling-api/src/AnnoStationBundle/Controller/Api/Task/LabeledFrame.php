<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service;
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
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @param Facade\LabeledFrame    $labeledFrameFacade
     * @param Facade\LabelingTask    $labelingTaskFacade
     * @param Service\TaskIncomplete $taskIncompleteService
     * @param Service\Authorization  $authorizationService
     */
    public function __construct(
        Facade\LabeledFrame $labeledFrameFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\TaskIncomplete $taskIncompleteService,
        Service\Authorization $authorizationService
    ) {
        $this->labeledFrameFacade = $labeledFrameFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->taskIncompleteService = $taskIncompleteService;
        $this->authorizationService = $authorizationService;
    }

    /**
     * @Rest\Get("/{task}/labeledFrame/{frameIndex}")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     * @param int                    $frameIndex
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledFrameAction(
        HttpFoundation\Request $request,
        Model\LabelingTask $task,
        $frameIndex
    ) {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        $frameIndex  = (int) $frameIndex;
        $offset       = $request->query->get('offset');
        $limit        = $request->query->get('limit');

        $labeledFrame = $this->labelingTaskFacade->getCurrentOrPreceedingLabeledFrame($task, $frameIndex);

        if ($labeledFrame === null) {
            $labeledFrame = new Model\LabeledFrame($task, $frameIndex);
        } elseif ($labeledFrame->getFrameIndex() !== $frameIndex) {
            $labeledFrame = $labeledFrame->copyToFrameIndex($frameIndex);
        }

        if ($offset !== null && $limit !== null) {
            $labeledFrames = $this->labelingTaskFacade->getLabeledFrames(
                $task,
                $frameIndex + $offset + 1,
                $frameIndex + $offset + $limit - 1
            );

            $result = [];

            foreach (range($frameIndex + $offset, $frameIndex + $offset + $limit - 1) as $frameIndex) {
                if (!empty($labeledFrames) && $labeledFrames[0]->getFrameIndex() <= $frameIndex) {
                    $labeledFrame = array_shift($labeledFrames);
                }

                if ($frameIndex != $labeledFrame->getFrameIndex()) {
                    $result[] = $labeledFrame->copyToFrameIndex($frameIndex);
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
     * @Rest\Delete("/{task}/labeledFrame/{frameIndex}")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask $task
     * @param int                $frameIndex
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteLabeledFrameAction(Model\LabelingTask $task, $frameIndex)
    {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        if (($labeledFrame = $this->labelingTaskFacade->getLabeledFrame($task, $frameIndex)) === null) {
            throw new Exception\NotFoundHttpException('LabeledFrame not found');
        }

        $this->labeledFrameFacade->delete($labeledFrame);

        return View\View::create()->setData(['success' => true]);
    }

    /**
     *
     * @Rest\Put("/{task}/labeledFrame/{frameIndex}")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask     $task
     * @param int                    $frameIndex
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function putLabeledThingInFrameAction(
        Model\LabelingTask $task,
        $frameIndex,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        $labeledFrameId  = $request->request->get('id');
        $revision        = $request->request->get('rev');
        $bodyFrameIndex = (int) $request->request->get('frameIndex');
        $classes         = $request->request->get('classes', []);

        if (!is_array($classes) || $bodyFrameIndex !== (int) $frameIndex || $labeledFrameId === null) {
            throw new Exception\BadRequestHttpException('Missing classes, labeledFrameId or invalid bodyFrameIndex');
        }

        if (($labeledFrame = $this->labelingTaskFacade->getLabeledFrame($task, $frameIndex)) === null) {
            $labeledFrame = new Model\LabeledFrame($task, $frameIndex);
            $labeledFrame->setId($labeledFrameId);
        } elseif ($labeledFrame->getRev() !== $revision) {
            // TODO: Synchronize with frontend team to find a better solution here!
            //throw new Exception\ConflictHttpException();
        }

        // I'm not quite sure about changing the id but since we are requesting
        // the labeledFrame by task and frameIndex, the id might be able to
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
