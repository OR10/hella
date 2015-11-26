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
use Doctrine\ODM\CouchDB;

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
     * @Rest\Get("/{taskId}/labeledThing")
     *
     * @param                        $taskId
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingAction($taskId, HttpFoundation\Request $request)
    {
        $response = View\View::create();
        $task     = $this->labelingTaskFacade->find($taskId);
        if ($task === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $labeledThings = $this->labelingTaskFacade->getLabeledThings($task);

        if ($labeledThings === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $response->setData($labeledThings);

        return $response;
    }

    /**
     * @Rest\Post("/{taskId}/labeledThing")
     *
     * @param                        $taskId
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function saveLabeledThingAction($taskId, HttpFoundation\Request $request)
    {
        $task = $this->labelingTaskFacade->find($taskId);

        if ($task === null) {
            throw new Exception\NotFoundHttpException();
        }

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
     * @Rest\Put("/{taskId}/labeledThing/{labeledThingId}")
     *
     * @param                        $taskId
     * @param                        $labeledThingId
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function updateLabeledThingAction($taskId, $labeledThingId, HttpFoundation\Request $request)
    {
        $task = $this->labelingTaskFacade->find($taskId);

        if ($task === null) {
            throw new Exception\NotFoundHttpException();
        }

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

            if ($labeledThing->getLabelingTaskId() !== $taskId) {
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
     * @Rest\Delete("/{taskId}/labeledThing/{labeledThingId}")
     *
     * @param                        $taskId
     * @param                        $labeledThingId
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function deleteLabeledThingAction($taskId, $labeledThingId, HttpFoundation\Request $request)
    {
        $response = View\View::create();

        $labeledThing = $this->labeledThingFacade->find($labeledThingId);
        if ($labeledThing === null) {
            $response->setStatusCode(404);

            return $response;
        }
        if ($labeledThing->getLabelingTaskId() !== $taskId) {
            throw new Exception\BadRequestHttpException();
        }
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
