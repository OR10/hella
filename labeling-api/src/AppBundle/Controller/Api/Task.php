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
        $offset     = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit      = $request->query->has('limit') ? $request->query->getInt('limit') : null;
        $taskPhase  = $request->query->get('phase', Model\LabelingTask::PHASE_LABELING);
        $taskStatus = $request->query->get('taskStatus');

        $project = null;
        if ($request->query->has('project')) {
            $project = $this->projectFacade->find($request->query->get('project'));
        }

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new Exception\BadRequestHttpException('Invalid offset or limit');
        }

        $numberOfTotalDocumentsByStatus = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);

        $tasks = [];
        $numberOfTotalDocuments = 0;
        switch ($taskStatus) {
            case Model\LabelingTask::STATUS_PREPROCESSING:
                if ($this->userFacade->isLabelCoordinator() || $this->userFacade->isAdmin()) {
                    $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                        Model\LabelingTask::STATUS_PREPROCESSING, $project, $offset, $limit, $taskPhase
                    )->toArray();
                    $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$taskPhase][Model\LabelingTask::STATUS_PREPROCESSING];
                }
                break;
            case Model\LabelingTask::STATUS_IN_PROGRESS:
                $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                    Model\LabelingTask::STATUS_IN_PROGRESS, $project, $offset, $limit, $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$taskPhase][Model\LabelingTask::STATUS_IN_PROGRESS];
                break;
            case Model\LabelingTask::STATUS_TODO:
                $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                    Model\LabelingTask::STATUS_TODO, $project, $offset, $limit, $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$taskPhase][Model\LabelingTask::STATUS_TODO];
                break;
            case Model\LabelingTask::STATUS_DONE:
                if ($this->userFacade->isLabeler() || $this->userFacade->isLabelCoordinator() || $this->userFacade->isAdmin()) {
                    $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                        Model\LabelingTask::STATUS_DONE, $project, $offset, $limit, $taskPhase
                    )->toArray();
                }
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[$taskPhase][Model\LabelingTask::STATUS_DONE];
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
            new Response\Task($tasks, $this->videoFacade, $this->userFacade, $this->projectFacade, $numberOfTotalDocuments, $taskPhase),
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
        $users = array();
        $users = array_merge(
            $this->userFacade->getUserByIds(
                array_unique(
                    array_filter(
                        array_map(
                            function ($historyEntry) {
                                return $historyEntry['userId'];
                            },
                            $task->getAssignmentHistory() === null ? [] : $task->getAssignmentHistory()
                        )
                        , function ($userId) {
                        return $userId !== null;
                    })
                )
            , false)
            , $users
        );

        $userByUserIds = array();
        /** @var Model\User $user */
        foreach ($users as $user) {
            $userByUserIds[$user->getId()] = $user;
        }

        return View\View::create()->setData(
            [
                'result' => [
                    'task' => $task,
                    'users' => $userByUserIds,
                ]
            ]
        );
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
