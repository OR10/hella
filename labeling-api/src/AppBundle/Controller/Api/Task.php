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
use AppBundle\Response;

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
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Facade\Video        $videoFacade
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Service\FrameCdn    $frameCdn
     * @param Facade\User         $userFacade
     * @param Facade\Project      $projectFacade
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\FrameCdn $frameCdn,
        Facade\User $userFacade,
        Facade\Project $projectFacade
    )
    {
        $this->videoFacade        = $videoFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->frameCdn           = $frameCdn;
        $this->userFacade         = $userFacade;
        $this->projectFacade      = $projectFacade;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $offset      = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit       = $request->query->has('limit') ? $request->query->getInt('limit') : null;
        $taskStatus  = $request->query->has('taskStatus') ? $request->query->get('taskStatus') : null;

        $project = null;
        if ($request->query->has('project')) {
            $project = $this->projectFacade->find($request->query->get('project'));
        }

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new Exception\BadRequestHttpException('Invalid offset or limit');
        }

        $numberOfTotalDocumentsByStatus = $this->labelingTaskFacade->getSumOfTasksByProject($project);

        $tasks = [];
        $numberOfTotalDocuments = 0;
        switch ($taskStatus) {
            case Model\LabelingTask::STATUS_PREPROCESSING:
                if ($this->userFacade->isLabelCoordinator() || $this->userFacade->isAdmin()) {
                    $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                        Model\LabelingTask::STATUS_PREPROCESSING, $project, $offset, $limit
                    )->toArray();
                    $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$project->getId()][Model\LabelingTask::STATUS_PREPROCESSING];
                }
                break;
            case Model\LabelingTask::STATUS_WAITING:
                $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                    Model\LabelingTask::STATUS_WAITING, $project, $offset, $limit
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$project->getId()][Model\LabelingTask::STATUS_WAITING];
                break;
            case Model\LabelingTask::STATUS_LABELED:
                if ($this->userFacade->isLabelCoordinator() || $this->userFacade->isAdmin()) {
                    $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                        Model\LabelingTask::STATUS_LABELED, $project, $offset, $limit
                    )->toArray();
                }
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$project->getId()][Model\LabelingTask::STATUS_LABELED];
                break;
        }

        usort($tasks, function ($a, $b) {
            if ($a->getCreatedAt() === null || $b->getCreatedAt() === null) {
                return -1;
            }
            if ($a->getCreatedAt()->getTimestamp() === $b->getCreatedAt()->getTimestamp()) {
                return 0;
            }
            return ($a->getCreatedAt()->getTimestamp() > $b->getCreatedAt()->getTimestamp()) ? -1 : 1;
        });

        return new View\View(
            [
                'totalRows' => $numberOfTotalDocuments,
                'result' => new Response\Task($tasks, $this->videoFacade, $this->userFacade, $this->projectFacade)
            ],
            HttpFoundation\Response::HTTP_ACCEPTED
        );
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
     *
     * @Rest\Get("/{task}/labelStructure")
     *
     * @param $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getTaskLabelStructureAction(Model\LabelingTask $task)
    {
        return View\View::create()->setData(
            [
                'result' => [
                    'structure' => $this->labelingTaskFacade->getLabelStructure($task),
                    'annotation' => $this->labelingTaskFacade->getLabelAnnotation($task),
                ]
            ]
        );
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
        $offset            = $request->query->getDigits('offset');
        $limit             = $request->query->getDigits('limit');
        $frameIndexMapping = $task->getFrameNumberMapping();

        if ($offset !== '') {
            $frameIndexMapping = array_slice($frameIndexMapping, $offset, null, true);
        }

        if ($limit !== '') {
            $frameIndexMapping = array_slice($frameIndexMapping, 0, $limit, true);
        }

        $data = $this->frameCdn->getFrameLocations($task, ImageType\Base::create($type), $frameIndexMapping);

        return View\View::create()->setData(['result' => $data]);
    }
}
