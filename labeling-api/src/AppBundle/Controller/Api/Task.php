<?php

namespace AppBundle\Controller\Api;

use AppBundle\Type\Video\Base;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task")
 */
class Task extends Controller\Base
{

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;
    /**
     * @var Facade\FrameCdn
     */
    private $frameCdnFacade;

    public function __construct(Facade\LabelingTask $labelingTask, Facade\FrameCdn $frameCdn)
    {
        $this->labelingTaskFacade = $labelingTask;
        $this->frameCdnFacade     = $frameCdn;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("/")
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listAction()
    {
        $tasks  = $this->labelingTaskFacade->findAll();
        $result = [
            'total_count' => $tasks->getTotalRows(),
            'result'      => $tasks->toArray(),
        ];

        return View\View::create()
            ->setData($result);
    }

    /**
     * Return the labeling task with the given id
     *
     * @Rest\Get("/{id}")
     * @param $id
     *
     * @return \FOS\RestBundle\View\View
     */
    public function showAction($id)
    {
        return View\View::create()
            ->setData($this->labelingTaskFacade->find($id));
    }

    /**
     * Get the frame locations for the given task id and type
     *
     * @Rest\Get("/{taskId}/frameLocations/{type}")
     * @param                        $taskId
     * @param                        $type
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function showFrameLocationsAction($taskId, $type, HttpFoundation\Request $request)
    {
        $limit  = $request->query->getDigits('limit', 20);
        $offset = $request->query->getDigits('offset', 0);
        $task   = $this->labelingTaskFacade->find($taskId);
        $data   = $this->frameCdnFacade->getFrameLocations($task, new Base(), $limit, $offset);

        $result = [
            'result' => $data,
        ];

        return View\View::create()->setData($result);
    }

}
// http://symfony.com/doc/current/bundles/FOSRestBundle/6-automatic-route-generation_multiple-restful-controllers.html