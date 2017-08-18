<?php

namespace AnnoStationBundle\Controller\Api\v1\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.attention")
 *
 * @CloseSession
 */
class Attention extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        Service\Authorization $authorizationService,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->projectFacade        = $projectFacade;
        $this->authorizationService = $authorizationService;
        $this->userPermissions      = $userPermissions;
    }

    /**
     * @Rest\Post("/{task}/attention/enable")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function enableAttentionFlagAction(Model\LabelingTask $task)
    {
        if ($this->userPermissions->hasPermission('canFlagLabelingTask')) {
            $project = $this->projectFacade->find($task->getProjectId());
            $this->authorizationService->denyIfProjectIsNotWritable($project);
        } else {
            $this->authorizationService->denyIfTaskIsNotWritable($task);
        }

        $task->setTaskAttentionFlag(true);
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Post("/{task}/attention/disable")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function disableAttentionFlagAction(Model\LabelingTask $task)
    {
        if ($this->userPermissions->hasPermission('canUnflagLabelingTask')) {
            $project = $this->projectFacade->find($task->getProjectId());
            $this->authorizationService->denyIfProjectIsNotWritable($project);
        } else {
            $this->authorizationService->denyIfTaskIsNotWritable($task);
        }

        $task->setTaskAttentionFlag(false);
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}
