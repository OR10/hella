<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\ForbidReadonlyTasks;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use AppBundle\Response;

/**
 * @Rest\Prefix("/api/project")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project.attention")
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
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Video $videoFacade,
        Facade\User $userFacade,
        Facade\Project $projectFacade
    ) {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->videoFacade        = $videoFacade;
        $this->userFacade         = $userFacade;
        $this->projectFacade      = $projectFacade;
    }

    /**
     *
     * @Rest\GET("/{project}/attentionTasks")
     *
     * @CheckPermissions({"canViewAttentionTasks"})
     *
     * @param HttpFoundation\Request $request
     * @param Model\Project          $project
     *
     * @return View\View
     */
    public function getAttentionLabelingTasksAction(HttpFoundation\Request $request, Model\Project $project)
    {
        $offset     = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit      = $request->query->has('limit') ? $request->query->getInt('limit') : null;

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new Exception\BadRequestHttpException('Invalid offset or limit');
        }

        $tasks = $this->labelingTaskFacade->getAttentionTasksForProject($project, $offset, $limit);

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
                $this->labelingTaskFacade->getTotalAttentionTasksCountForProject($project)
            ),
            HttpFoundation\Response::HTTP_OK
        );
    }
}