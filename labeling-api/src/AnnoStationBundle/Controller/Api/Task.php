<?php

namespace AnnoStationBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Response;
use AnnoStationBundle\Service;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AnnoStationBundle\Annotations\CheckPermissions;

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
     * @var Service\FrameCdn
     */
    private $frameCdn;

    /**
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @param Facade\Video          $videoFacade
     * @param Facade\LabelingTask   $labelingTaskFacade
     * @param Service\FrameCdn      $frameCdn
     * @param AppFacade\User        $userFacade
     * @param Facade\Project        $projectFacade
     * @param Storage\TokenStorage  $tokenStorage
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\FrameCdn $frameCdn,
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService
    ) {
        $this->videoFacade          = $videoFacade;
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->frameCdn             = $frameCdn;
        $this->userFacade           = $userFacade;
        $this->projectFacade        = $projectFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->authorizationService = $authorizationService;
    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
     *
     * @CheckPermissions({"canViewTaskList"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $offset     = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit      = $request->query->has('limit') ? $request->query->getInt('limit') : null;
        $taskPhase  = $request->query->get('phase');
        $taskStatus = $request->query->get('taskStatus');
        /** @var Model\User $user */
        $user       = $this->tokenStorage->getToken()->getUser();

        $project = null;
        if ($request->query->has('project')) {
            $project = $this->projectFacade->find($request->query->get('project'));

            if (!$project->isAccessibleBy($user)) {
                throw new Exception\BadRequestHttpException('You are not allowed to access this project!');
            }
        }

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new Exception\BadRequestHttpException('Invalid offset or limit');
        }

        if (isset($taskPhase)) {
            $numberOfTotalDocumentsByStatus = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
            $numberOfTotalDocumentsByStatus = $numberOfTotalDocumentsByStatus[$taskPhase];
        }

        $tasks                  = [];
        $numberOfTotalDocuments = 0;
        switch ($taskStatus) {
            case Model\LabelingTask::STATUS_IN_PROGRESS:
                $tasks                  = $this->labelingTaskFacade->findAllByStatusAndProject(
                    Model\LabelingTask::STATUS_IN_PROGRESS,
                    $project,
                    $offset,
                    $limit,
                    $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[Model\LabelingTask::STATUS_IN_PROGRESS];
                break;
            case Model\LabelingTask::STATUS_TODO:
                $tasks                  = $this->labelingTaskFacade->findAllByStatusAndProject(
                    Model\LabelingTask::STATUS_TODO,
                    $project,
                    $offset,
                    $limit,
                    $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[Model\LabelingTask::STATUS_TODO];
                break;
            case Model\LabelingTask::STATUS_DONE:
                $tasks                  = $this->labelingTaskFacade->findAllByStatusAndProject(
                    Model\LabelingTask::STATUS_DONE,
                    $project,
                    $offset,
                    $limit,
                    $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[Model\LabelingTask::STATUS_DONE];
                break;
            case Model\LabelingTask::STATUS_ALL_PHASES_DONE:
                $tasks = $this->labelingTaskFacade->getAllDoneLabelingTasksForProject(
                    $project,
                    $offset,
                    $limit
                )->toArray();

                $numberOfTotalDocuments = $this->labelingTaskFacade->getSumOfAllDoneLabelingTasksForProject(
                    $project
                );
                break;
        }

        usort(
            $tasks,
            function ($a, $b) {
                if ($a->getCreatedAt() === null || $b->getCreatedAt() === null) {
                    return -1;
                }
                if ($a->getCreatedAt()->getTimestamp() === $b->getCreatedAt()->getTimestamp()) {
                    return 0;
                }

                return ($a->getCreatedAt()->getTimestamp() > $b->getCreatedAt()->getTimestamp()) ? -1 : 1;
            }
        );

        return new View\View(
            new Response\Tasks(
                $tasks,
                $this->videoFacade,
                $this->userFacade,
                $this->projectFacade,
                $numberOfTotalDocuments
            ),
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
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        $project = $this->projectFacade->find($task->getProjectId());
        $user    = $this->tokenStorage->getToken()->getUser();
        if (!$project->isAccessibleBy($user)) {
            throw new Exception\BadRequestHttpException('You are not allowed to access this project!');
        }

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
                        ),
                        function ($userId) {
                            return $userId !== null;
                        }
                    )
                ),
                false
            ),
            $users
        );

        $users = new Response\SimpleUsers($users);

        return View\View::create()->setData(
            [
                'result' => [
                    'task'  => $task,
                    'users' => $users->getResult(),
                ],
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
        $this->authorizationService->denyIfTaskIsNotReadable($task);

        return View\View::create()->setData(
            [
                'result' => [
                    'structure'  => $this->labelingTaskFacade->getLabelStructure($task),
                    'annotation' => $this->labelingTaskFacade->getLabelAnnotation($task),
                ],
            ]
        );
    }

    /**
     * Get the frame locations for the given task id and type
     *
     * TODO: Maybe it's better to place nested routes into an own controller,
     *       see https://goo.gl/IVs9CF
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
        $this->authorizationService->denyIfTaskIsNotReadable($task);

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
