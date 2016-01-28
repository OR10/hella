<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use AppBundle\Service;
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
     * LabeledThing constructor.
     *
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade
    )
    {
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
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
        $labeledThings = $this->labelingTaskFacade->getLabeledThings($task);

        return View\View::create()->setData([
            'totalCount' => count($labeledThings),
            'result' => $labeledThings,
        ]);
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
        $frameRange = $this->createFrameRange($request->request->get('frameRange'), $task->getFrameRange());
        if ($frameRange === null) {
            throw new Exception\BadRequestHttpException();
        }

        $task->getFrameRange()->throwIfFrameRangeIsNotCovered($frameRange);

        if (($labeledThingId = $request->request->get('id')) !== null) {
            if ($this->labeledThingFacade->find($labeledThingId) !== null) {
                throw new Exception\ConflictHttpException();
            }
        }

        if (!is_array($classes = $request->request->get('classes', []))) {
            throw new Exception\BadRequestHttpException();
        }
        if (($lineColor = $request->request->get('lineColor')) === null) {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThing = new Model\LabeledThing($task, $lineColor);
        $labeledThing->setId($labeledThingId);
        $labeledThing->setFrameRange($frameRange);
        $labeledThing->setClasses($classes);
        $labeledThing->setIncomplete($request->request->get('incomplete', true));
        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * @Rest\Get("/{taskId}/labeledThing/{labeledThing}")
     *
     * @param string                 $taskId
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingAction(
        $taskId,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        if ($labeledThing->getTaskId() !== $taskId) {
            throw new Exception\BadRequestHttpException();
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
        if (($lineColor = $request->request->get('lineColor')) === null) {
            throw new Exception\BadRequestHttpException();
        }

        if ($labeledThing === null) {
            $labeledThing = new Model\LabeledThing($task, $lineColor);
            $labeledThing->setId($request->attributes->get('_unresolvedLabeledThingId'));
        }

        if ($labeledThing->getTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException();
        }

        if ($request->request->get('rev') !== $labeledThing->getRev()) {
            throw new Exception\ConflictHttpException();
        }

        $frameRange = $this->createFrameRange($request->request->get('frameRange'), $task->getFrameRange());
        $classes    = $request->request->get('classes', []);
        $incomplete = $request->request->get('incomplete', true);

        if ($frameRange === null) {
            throw new Exception\BadRequestHttpException();
        }

        $task->getFrameRange()->throwIfFrameRangeIsNotCovered($frameRange);

        $this->labeledThingInFrameFacade->delete(
            array_merge(
                $this->adjustFrameRangeStart($labeledThing, $frameRange),
                $this->adjustFrameRangeEnd($labeledThing, $frameRange)
            )
        );

        $labeledThing->setClasses($classes);
        $labeledThing->setFrameRange($frameRange);
        $labeledThing->setIncomplete($incomplete);

        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * TODO: move deletion of labeledThingsInFrame to labeledThingFacade?
     *
     * @Rest\Delete("/{task}/labeledThing/{labeledThing}")
     * @ForbidReadonlyTasks
     *
     * @param Model\LabelingTask $task
     * @param Model\LabeledThing $labeledThing
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     * @internal param string $taskId
     */
    public function deleteLabeledThingAction(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        if ($labeledThing->getTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException();
        }

        if ($request->query->get('rev') !== $labeledThing->getRev()) {
            throw new Exception\ConflictHttpException();
        }

        $labeledThingInFrames = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->labeledThingInFrameFacade->delete($labeledThingInFrames);

        $this->labeledThingFacade->delete($labeledThing);

        return View\View::create()->setData(['success' => true]);
    }

    /**
     * Adjust preceeding labeledThingsInFrame and return all
     * labeledthingsInFrame that have to be deleted.
     */
    private function adjustFrameRangeStart(Model\LabeledThing $labeledThing, Model\FrameRange $newFrameRange)
    {
        $previousFrameRange = $labeledThing->getFrameRange();

        if ($newFrameRange->getStartFrameNumber() <= $previousFrameRange->getStartFrameNumber()) {
            return [];
        }

        $preceedingLabeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $previousFrameRange->getStartFrameNumber(),
            0,
            $newFrameRange->getStartFrameNumber() - $previousFrameRange->getStartFrameNumber() + 1
        );
        if (!empty($preceedingLabeledThingsInFrame)) {
            $lastPreceedingLabeledThingInFrame = array_pop($preceedingLabeledThingsInFrame);
            if ($lastPreceedingLabeledThingInFrame->getFrameNumber() < $newFrameRange->getStartFrameNumber()) {
                $lastPreceedingLabeledThingInFrame->setFrameNumber($newFrameRange->getStartFrameNumber());
                $this->labeledThingInFrameFacade->save($lastPreceedingLabeledThingInFrame);
            }
        }

        return $preceedingLabeledThingsInFrame;
    }

    /**
     * Adjust succeeding labeledThingsInFrame and return all
     * labeledthingsInFrame that have to be deleted.
     */
    private function adjustFrameRangeEnd(Model\LabeledThing $labeledThing, Model\FrameRange $newFrameRange)
    {
        $previousFrameRange = $labeledThing->getFrameRange();

        if ($newFrameRange->getEndFrameNumber() >= $previousFrameRange->getEndFrameNumber()) {
            return [];
        }

        $succeedingLabeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $newFrameRange->getEndFrameNumber(),
            0,
            $previousFrameRange->getEndFrameNumber() - $newFrameRange->getEndFrameNumber() + 1
        );

        if (!empty($succeedingLabeledThingsInFrame)) {
            $lastSucceedingLabeledThingInFrame = array_shift($succeedingLabeledThingsInFrame);
            if ($lastSucceedingLabeledThingInFrame->getFrameNumber() > $newFrameRange->getEndFrameNumber()) {
                $lastSucceedingLabeledThingInFrame->setFrameNumber($newFrameRange->getEndFrameNumber());
                $this->labeledThingInFrameFacade->save($lastSucceedingLabeledThingInFrame);
            }
        }

        return $succeedingLabeledThingsInFrame;
    }
}
