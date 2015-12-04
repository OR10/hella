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

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task")
 *
 * @CloseSession
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
        $tasks = $this->labelingTaskFacade->findAll();

        $taskResult = array_values(array_filter($tasks, function ($task) {
            $imageTypes = $this->labelingTaskFacade->getVideo($task)->getImageTypes();
            foreach ($task->getRequiredImageTypes() as $requiredImageType) {
                if ($imageTypes[$requiredImageType]['converted'] === false) {
                    return false;
                }
            }

            return true;
        }));

        $result = [
            'totalCount' => count($taskResult),
            'result'     => $taskResult,
        ];

        return View\View::create()
            ->setData($result);
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
