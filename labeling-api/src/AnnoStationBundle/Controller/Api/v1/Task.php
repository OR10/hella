<?php

namespace AnnoStationBundle\Controller\Api\v1;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Response;
use AnnoStationBundle\Service;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/task")
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
     * @var Service\v1\TaskService
     */
    private $taskService;

    /**
     * @var Facade\LabeledFrame\TaskDatabase
     */
    private $labeledFrameFactory;

    /**
     * @var Service\LabeledFrameService
     */
    private $labeledFrameService;

    /**
     * Task constructor.
     *
     * @param Facade\Video            $videoFacade
     * @param Facade\LabelingTask     $labelingTaskFacade
     * @param Service\FrameCdn        $frameCdn
     * @param AppFacade\User          $userFacade
     * @param Facade\Project          $projectFacade
     * @param Storage\TokenStorage    $tokenStorage
     * @param Service\Authorization   $authorizationService
     * @param Service\v1\TaskService  $taskService
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\FrameCdn $frameCdn,
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Storage\TokenStorage $tokenStorage,
        Service\Authorization $authorizationService,
        Service\v1\TaskService $taskService,
        Facade\LabeledFrame\TaskDatabase $labeledFrameFactory,
        Service\LabeledFrameService $labeledFramService
    ) {
        $this->videoFacade          = $videoFacade;
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->frameCdn             = $frameCdn;
        $this->userFacade           = $userFacade;
        $this->projectFacade        = $projectFacade;
        $this->tokenStorage         = $tokenStorage;
        $this->authorizationService = $authorizationService;
        $this->taskService          = $taskService;
        $this->labeledFrameFactory  = $labeledFrameFactory;
        $this->labeledFrameService  = $labeledFramService;

    }

    /**
     * List all labeling tasks
     *
     * @Rest\Get("")
     *
     * @Annotations\CheckPermissions({"canViewTaskList"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();
        /** get task*/
        $task = $this->taskService->getTask($request);

        return new View\View(
            new Response\Tasks(
                $task['tasks'],
                $this->videoFacade,
                $this->userFacade,
                $this->projectFacade,
                $task['numberOfTotalDocuments']
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
     * @Rest\Get("/{task}/taskAttribute")
     *
     * @param $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function checkTaskAttrAction(Model\LabelingTask $task, HttpFoundation\Request $request)
    {
        $projectId = $request->query->get('projectId');
        $frameIndex = $request->query->getInt('frameIndex');
        $labeledFrameFactory = $this->labeledFrameFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $task->getId()
        );
        $labeledFrames = $labeledFrameFactory->findBylabelingTask($task, $frameIndex);
        $lFrameAttr = $this->labeledFrameService->getFrameEmptyAttribute($labeledFrames);

        return View\View::create()->setData(
            [
                'result' => $lFrameAttr,
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
