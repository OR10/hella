<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
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

        if (($labeledThingId = $request->request->get('id')) !== null) {
            if ($this->labeledThingFacade->find($labeledThingId) !== null) {
                throw new Exception\ConflictHttpException();
            }
        }

        if (!is_array($classes = $request->request->get('classes', []))) {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThing = new Model\LabeledThing($task);
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
     *
     * @param Model\LabelingTask      $task
     * @param Model\LabeledThing|null $labeledThing
     * @param HttpFoundation\Request  $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function updateLabeledThingAction(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing = null,
        HttpFoundation\Request $request
    ) {
        if ($labeledThing === null) {
            $labeledThing = new Model\LabeledThing($task);
            $labeledThing->setId($request->request->get('labeledThing'));
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

        $labeledThing->setClasses($classes);
        $labeledThing->setFrameRange($frameRange);
        $labeledThing->setIncomplete($incomplete);

        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * TODO: move deletion of labeledThingsInFrame to labeledThingFacade?
     *
     * @Rest\Delete("/{taskId}/labeledThing/{labeledThing}")
     *
     * @param string                 $taskId
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function deleteLabeledThingAction(
        $taskId,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        if ($labeledThing->getTaskId() !== $taskId) {
            throw new Exception\BadRequestHttpException();
        }

        if ($request->request->get('rev') !== $labeledThing->getRev()) {
            throw new Exception\ConflictHttpException();
        }

        $labeledThingInFrames = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $this->labeledThingInFrameFacade->delete($labeledThingInFrame);
        }

        $this->labeledThingFacade->delete($labeledThing);

        return View\View::create()->setData(['success' => true]);
    }
}
