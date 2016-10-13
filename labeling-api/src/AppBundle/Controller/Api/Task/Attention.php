<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Rest\Prefix("/api/task")
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
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        Service\Authorization $authorizationService,
        Storage\TokenStorage $tokenStorage
    ) {
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->projectFacade        = $projectFacade;
        $this->authorizationService = $authorizationService;
        $this->tokenStorage         = $tokenStorage;
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
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
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
     * @Security("has_role('ROLE_LABEL_COORDINATOR')")
     *
     * @param Model\LabelingTask $task
     *
     * @return \FOS\RestBundle\View\View
     */
    public function disableAttentionFlagAction(Model\LabelingTask $task)
    {
        $project = $this->projectFacade->find($task->getProjectId());
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $task->setTaskAttentionFlag(false);
        $this->labelingTaskFacade->save($task);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}