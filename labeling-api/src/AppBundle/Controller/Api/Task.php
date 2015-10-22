<?php

namespace AppBundle\Controller\Api;

use AppBundle\Model\Video\ImageType;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use AppBundle\Service;

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
    private $frameCdn;

    public function __construct(Facade\LabelingTask $labelingTask, Service\FrameCdn $frameCdn)
    {
        $this->labelingTaskFacade = $labelingTask;
        $this->frameCdn     = $frameCdn;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
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
        $task   = $this->labelingTaskFacade->find($taskId);
        $limit  = $request->query->getDigits('limit', 20);
        $offset = $request->query->getDigits('offset', 0);
        $data   = $this->frameCdn->getFrameLocations($task, ImageType\Base::create($type), $limit, $offset);

        $result = [
            'result' => $data,
        ];

        return View\View::create()->setData($result);
    }

}
// http://symfony.com/doc/current/bundles/FOSRestBundle/6-automatic-route-generation_multiple-restful-controllers.html