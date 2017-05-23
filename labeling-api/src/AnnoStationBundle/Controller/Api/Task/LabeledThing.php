<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\View;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use Doctrine\ODM\CouchDB;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.labeled_thing")
 *
 * @CloseSession
 */
class LabeledThing extends Controller\Base
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * LabeledThing constructor.
     *
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Service\TaskIncomplete     $taskIncompleteService
     * @param Service\Authorization      $authorizationService
     */
    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Service\TaskIncomplete $taskIncompleteService,
        Service\Authorization $authorizationService
    ) {
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->taskIncompleteService     = $taskIncompleteService;
        $this->authorizationService      = $authorizationService;
    }

    /**
     * @Rest\Get("/{task}/labeledThing")
     *
     * @param Model\LabelingTask     $task
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getAllLabeledThingsAction(Model\LabelingTask $task, HttpFoundation\Request $request)
    {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        if ($request->query->get('incompleteOnly', false) === 'true') {
            $labeledThings = $this->labeledThingFacade->getIncompleteLabeledThings($task);
        } else {
            $labeledThings = $this->labeledThingFacade->findByTaskId($task);
        }

        return View\View::create()->setData(
            [
                'totalCount' => count($labeledThings),
                'result'     => $labeledThings,
            ]
        );
    }

    /**
     * @Rest\Get("/{task}/labeledThingsIncompleteCount")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getAllIncompleteLabeledThingsCountAction(Model\LabelingTask $task)
    {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        $labeledThings = $this->labeledThingFacade->getIncompleteLabeledThings($task);

        return View\View::create()->setData(
            [
                'result' => ['count' => count($labeledThings)],
            ]
        );
    }

    /**
     * @Rest\Post("/{task}/labeledThing")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask     $task
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function saveLabeledThingAction(Model\LabelingTask $task, HttpFoundation\Request $request)
    {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        if (($labeledThingId = $request->request->get('id')) !== null) {
            if ($this->labeledThingFacade->find($labeledThingId) !== null) {
                throw new Exception\BadRequestHttpException('LabeledThing not found');
            }
        }

        if (!is_array($classes = $request->request->get('classes', []))) {
            throw new Exception\BadRequestHttpException('Missing classes');
        }
        if (($lineColor = $request->request->get('lineColor')) === null) {
            throw new Exception\BadRequestHttpException('Missing lineColor');
        }

        $labeledThing = new Model\LabeledThing($task, $lineColor);
        $labeledThing->setId($labeledThingId);
        $labeledThing->setClasses($classes);
        $labeledThing->setIncomplete(
            $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
        );
        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * @Rest\Get("/{task}/labeledThing/{labeledThing}")
     *
     * @param Model\LabelingTask     $task
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingAction(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        if ($labeledThing->getTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException('Requested LabeledThing is not valid for this task');
        }

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * @Rest\Put("/{task}/labeledThing/{labeledThing}")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask      $task
     * @param HttpFoundation\Request  $request
     * @param Model\LabeledThing|null $labeledThing
     *
     * @return \FOS\RestBundle\View\View
     */
    public function updateLabeledThingAction(
        Model\LabelingTask $task,
        HttpFoundation\Request $request,
        Model\LabeledThing $labeledThing = null
    ) {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        if (($lineColor = $request->request->get('lineColor')) === null) {
            throw new Exception\BadRequestHttpException('Missing lineColor');
        }

        if ($labeledThing === null) {
            $labeledThing = new Model\LabeledThing($task, $lineColor);
            $labeledThing->setId($request->attributes->get('_unresolvedLabeledThingId'));
        }

        if ($labeledThing->getTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException('Requested LabeledThing is not valid for this task');
        }

        if ($request->request->get('rev') !== $labeledThing->getRev()) {
            throw new Exception\ConflictHttpException('Invalid revision');
        }
        if ($task->getLabelInstruction() === Model\LabelingTask::INSTRUCTION_LANE) {
            $classes = ['Lane-Exit'];
        } else {
            $classes = $request->request->get('classes', []);
        }
        $frameRange = $this->createFrameRange(
            $request->request->get('frameRange'),
            new Model\FrameIndexRange(min($task->getFrameNumberMapping()), max($task->getFrameNumberMapping()))
        );
        if ($frameRange === null) {
            throw new Exception\BadRequestHttpException('Missing frameRange');
        }

        $this->labeledThingInFrameFacade->delete(
            array_merge(
                $this->adjustFrameRangeStart($labeledThing, $frameRange),
                $this->adjustFrameRangeEnd($labeledThing, $frameRange)
            )
        );

        $labeledThing->setClasses($classes);
        $labeledThing->setFrameRange($frameRange);
        $labeledThing->setGroupIds($request->request->get('groupIds', []));
        $labeledThing->setIncomplete(
            $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
        );

        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * TODO: move deletion of labeledThingsInFrame to labeledThingFacade?
     *
     * @Rest\Delete("/{task}/labeledThing/{labeledThing}")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask     $task
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteLabeledThingAction(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfTaskIsNotWritable($task);

        if ($labeledThing->getTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException('Requested LabeledThing is not valid for this task');
        }

        if ($request->query->get('rev') !== $labeledThing->getRev()) {
            throw new Exception\ConflictHttpException('Invalid Revision');
        }

        $labeledThingInFrames = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->labeledThingInFrameFacade->delete($labeledThingInFrames);

        $this->labeledThingFacade->delete($labeledThing);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * Adjust preceeding labeledThingsInFrame and return all
     * labeledthingsInFrame that have to be deleted.
     */
    private function adjustFrameRangeStart(Model\LabeledThing $labeledThing, Model\FrameIndexRange $newFrameRange)
    {
        $previousFrameRange = $labeledThing->getFrameRange();

        if ($newFrameRange->getStartFrameIndex() <= $previousFrameRange->getStartFrameIndex()) {
            return [];
        }

        $preceedingLabeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $previousFrameRange->getStartFrameIndex(),
            0,
            $newFrameRange->getStartFrameIndex() - $previousFrameRange->getStartFrameIndex() + 1
        );
        if (!empty($preceedingLabeledThingsInFrame)) {
            $lastPreceedingLabeledThingInFrame = array_pop($preceedingLabeledThingsInFrame);
            if ($lastPreceedingLabeledThingInFrame->getFrameIndex() < $newFrameRange->getStartFrameIndex()) {
                $lastPreceedingLabeledThingInFrame->getFrameIndex($newFrameRange->getStartFrameIndex());
                $this->labeledThingInFrameFacade->save($lastPreceedingLabeledThingInFrame);
            }
        }

        return $preceedingLabeledThingsInFrame;
    }

    /**
     * Adjust succeeding labeledThingsInFrame and return all
     * labeledthingsInFrame that have to be deleted.
     */
    private function adjustFrameRangeEnd(Model\LabeledThing $labeledThing, Model\FrameIndexRange $newFrameRange)
    {
        $previousFrameRange = $labeledThing->getFrameRange();

        if ($newFrameRange->getEndFrameIndex() >= $previousFrameRange->getEndFrameIndex()) {
            return [];
        }

        $succeedingLabeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $newFrameRange->getEndFrameIndex(),
            0,
            $previousFrameRange->getEndFrameIndex() - $newFrameRange->getEndFrameIndex() + 1
        );

        if (!empty($succeedingLabeledThingsInFrame)) {
            $lastSucceedingLabeledThingInFrame = array_shift($succeedingLabeledThingsInFrame);
            if ($lastSucceedingLabeledThingInFrame->getFrameIndex() > $newFrameRange->getEndFrameIndex()) {
                $lastSucceedingLabeledThingInFrame->setFrameIndex($newFrameRange->getEndFrameIndex());
                $this->labeledThingInFrameFacade->save($lastSucceedingLabeledThingInFrame);
            }
        }

        return $succeedingLabeledThingsInFrame;
    }
}
