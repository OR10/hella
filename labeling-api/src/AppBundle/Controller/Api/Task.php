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

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Service\FrameCdn    $frameCdn
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, Service\FrameCdn $frameCdn)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->frameCdn           = $frameCdn;
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
            'totalCount' => $tasks->getTotalRows(),
            'result'     => $tasks->toArray(),
        ];

        return View\View::create()
            ->setData($result);
    }

    /**
     * Return the labeling task with the given id
     *
     * @Rest\Get("/{taskId}")
     * @param $taskId
     *
     * @return \FOS\RestBundle\View\View
     * @internal param $id
     *
     */
    public function getTaskAction($taskId)
    {
        $response = View\View::create();
        $task     = $this->labelingTaskFacade->find($taskId);

        if ($task === null) {
            $response->setStatusCode(404);
            $response->setData(['success' => 'false', 'msg' => 'Document not found']);

            return $response;
        }

        $response->setData(['result' => $this->labelingTaskFacade->find($taskId)]);

        return $response;
    }

    /**
     * Get the frame locations for the given task id and type
     *
     * TODO: Maybe it's better to place nested routes into an own controller,
     *       see http://symfony.com/doc/current/bundles/FOSRestBundle/6-automatic-route-generation_multiple-restful-controllers.html
     *       for details.
     *
     * @Rest\Get("/{taskId}/frameLocations/{type}")
     * @param string                 $taskId
     * @param string                 $type
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function showFrameLocationsAction($taskId, $type, HttpFoundation\Request $request)
    {
        $task   = $this->labelingTaskFacade->find($taskId);
        $offset = $request->query->getDigits('offset');
        $limit  = $request->query->getDigits('limit');
        $data   = $this->frameCdn->getFrameLocations(
            $task,
            ImageType\Base::create($type),
            $task->getFrameRange()->createSubRangeForOffsetAndLimit($offset, $limit)
        );

        return View\View::create()
            ->setData(['result' => $data]);
    }
}
