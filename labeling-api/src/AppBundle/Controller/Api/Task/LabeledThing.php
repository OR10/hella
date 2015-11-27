<?php

namespace AppBundle\Controller\Api\Task;

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
        if (($labeledThings = $this->labelingTaskFacade->getLabeledThings($task)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        return View\View::create()->setData($labeledThings);
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
        $documentId = $request->request->get('id');
        $classes    = $request->request->get('classes', []);
        $frameRange = $request->request->get('frameRange');
        $incomplete = $request->request->get('incomplete', true);

        if ($frameRange === null) {
            $frameRange = $task->getFrameRange();
        } elseif (is_array($frameRange)) {
            try {
                $frameRange = Model\FrameRange::createFromArray($frameRange);
            } catch (\Exception $e) {
                throw new Exception\BadRequestHttpException();
            }
        } else {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThing = new Model\LabeledThing($task);

        if ($documentId !== null) {
            $labeledThing->setId($documentId);
        }

        $labeledThing->setClasses($classes);
        $labeledThing->setFrameRange($frameRange);
        $labeledThing->setIncomplete($incomplete);
        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * @Rest\Get("/{task}/labeledThing/{labeledThing}")
     *
     * @param Model\LabelingTask     $task
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingAction(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        if ($labeledThing->getLabelingTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException();
        }

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * @Rest\Put("/{task}/labeledThing/{labeledThingId}")
     *
     * @param Model\LabelingTask     $task
     * @param string                 $labeledThingId
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function updateLabeledThingAction(
        Model\LabelingTask $task,
        $labeledThingId,
        HttpFoundation\Request $request
    ) {
        $revision = $request->request->get('rev');

        if ($revision === null) {
            $labeledThing = new Model\LabeledThing($task);
            $labeledThing->setId($labeledThingId);
        } else {
            $labeledThing = $this->labeledThingFacade->find($labeledThingId);

            if ($labeledThing === null) {
                throw new Exception\NotFoundHttpException();
            }

            if ($labeledThing->getRev() !== $revision) {
                throw new Exception\ConflictHttpException();
            }

            if ($labeledThing->getLabelingTaskId() !== $task->getId()) {
                throw new Exception\BadRequestHttpException();
            }
        }

        $classes    = $request->request->get('classes', []);
        $frameRange = $request->request->get('frameRange');
        $incomplete = $request->request->get('incomplete', true);

        if ($frameRange === null) {
            $frameRange = $task->getFrameRange();
        } elseif (is_array($frameRange)) {
            try {
                $frameRange = Model\FrameRange::createFromArray($frameRange);
            } catch (\Exception $e) {
                throw new Exception\BadRequestHttpException();
            }
        } else {
            throw new Exception\BadRequestHttpException();
        }

        $labeledThing->setClasses($classes);
        $labeledThing->setFrameRange($frameRange);
        $labeledThing->setIncomplete($incomplete);

        $this->labeledThingFacade->save($labeledThing);

        return View\View::create()->setData(['result' => $labeledThing]);
    }

    /**
     * @Rest\Delete("/{task}/labeledThing/{labeledThing}")
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
        if ($labeledThing->getLabelingTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException();
        }

        $response = View\View::create();

        if ($request->request->get('rev') !== $labeledThing->getRev()) {
            $response->setStatusCode(409);

            return $response;
        }

        $labeledThingInFrames = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $this->labeledThingInFrameFacade->delete($labeledThingInFrame);
        }

        $this->labeledThingFacade->delete($labeledThing);

        $response->setData(['success' => true]);

        return $response;
    }
}
