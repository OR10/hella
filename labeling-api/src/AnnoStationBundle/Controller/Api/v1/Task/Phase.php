<?php

namespace AnnoStationBundle\Controller\Api\v1\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.phase")
 *
 * @CloseSession
 */
class Phase extends Controller\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Service\v1\Task\PhaseService
     */
    private $taskPhaseService;

    /**
     * Phase constructor.
     *
     * @param Facade\LabelingTask            $labelingTaskFacade
     * @param Facade\Project                 $projectFacade
     * @param Service\Authorization          $authorizationService
     */
    public function __construct(
        Facade\Project $projectFacade,
        Service\Authorization $authorizationService,
        Service\v1\Task\PhaseService $taskPhaseService
    ) {
        $this->projectFacade        = $projectFacade;
        $this->authorizationService = $authorizationService;
        $this->taskPhaseService     = $taskPhaseService;
    }

    /**
     * @Rest\Put("/{task}/phase")
     * @Annotations\CheckPermissions({"canMoveTaskInOtherPhase"})
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return View\View
     */
    public function updateTaskPhaseAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);
        /** update task phase/status */
        $this->taskPhaseService->updateTaskPhase($request, $task);
        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}
