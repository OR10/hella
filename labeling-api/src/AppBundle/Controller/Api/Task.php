<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\View;
use AppBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task")
 *
 * @CloseSession
 */
class Task extends Controller\Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\FrameCdn
     */
    private $frameCdn;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @param Facade\Video $videoFacade
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Service\FrameCdn $frameCdn
     * @param Facade\User $userFacade
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\FrameCdn $frameCdn,
        Facade\User $userFacade
    ) {
        $this->videoFacade        = $videoFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->frameCdn           = $frameCdn;
        $this->userFacade         = $userFacade;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $fetchVideos = $request->query->getBoolean('includeVideos', false);
        $offset      = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit       = $request->query->has('limit') ? $request->query->getInt('limit') : null;

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new Exception\BadRequestHttpException();
        }

        $tasks = array(
            'waiting' => $this->labelingTaskFacade->findAllByStatus(null, 'waiting', $offset, $limit )
        );

        if ($this->userFacade->isLabelCoordinator() || $this->userFacade->isAdmin()) {
            $tasks['preprocessing'] = $this->labelingTaskFacade->findAllByStatus(null, 'preprocessing', $offset, $limit );
            $tasks['labeled']       = $this->labelingTaskFacade->findAllByStatus(null, 'labeled', $offset, $limit );
        }else{
            $tasks['preprocessing'] = null;
            $tasks['labeled']       = null;
        }

        if ($fetchVideos){
            $videos = $this->videoFacade->findAllForTasksIndexedById($tasks['waiting']);
            if ($this->userFacade->isLabelCoordinator() || $this->userFacade->isAdmin()) {
                $videos = array_merge($this->videoFacade->findAllForTasksIndexedById($tasks['preprocessing']), $videos);
                $videos = array_merge($this->videoFacade->findAllForTasksIndexedById($tasks['labeled']), $videos);
            }
        }else{
            $videos = [];
        }

        return View\View::create()->setData([
            'result' => [
                'tasks' => $tasks,
                'videos' => $videos,
            ]
        ]);
    }

    /**
     * Return the labeling task with the given id
     *
     * @Rest\Get("/{task}")
     *
     * @param $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getTaskAction(Model\LabelingTask $task)
    {
        return View\View::create()->setData(['result' => $task]);
    }

    /**
     * Get the frame locations for the given task id and type
     *
     * TODO: Maybe it's better to place nested routes into an own controller,
     *       see http://symfony.com/doc/current/bundles/FOSRestBundle/6-automatic-route-generation_multiple-restful-controllers.html
     *       for details.
     *
     * @Rest\Get("/{task}/frameLocations/{type}")
     *
     * @param Model\LabelingTask     $task
     * @param string                 $type
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function showFrameLocationsAction(Model\LabelingTask $task, $type, HttpFoundation\Request $request)
    {
        $offset   = $request->query->getDigits('offset');
        $limit    = $request->query->getDigits('limit');
        $subRange = $task->getFrameRange()->createSubRangeForOffsetAndLimit($offset, $limit);
        $data     = $this->frameCdn->getFrameLocations($task, ImageType\Base::create($type), $subRange);

        return View\View::create()->setData(['result' => $data]);
    }
}
