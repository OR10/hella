<?php

namespace AnnoStationBundle\Controller\Api\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use AnnoStationBundle\Response;

/**
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project.attention")
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
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Video $videoFacade,
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Service\Authorization $authorizationService
    ) {
        $this->labelingTaskFacade   = $labelingTaskFacade;
        $this->videoFacade          = $videoFacade;
        $this->userFacade           = $userFacade;
        $this->projectFacade        = $projectFacade;
        $this->authorizationService = $authorizationService;
    }

    /**
     *
     * @Rest\GET("/{organisation}/project/{project}/attentionTasks")
     *
     * @CheckPermissions({"canViewAttentionTasks"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param HttpFoundation\Request              $request
     * @param Model\Project                       $project
     *
     * @return View\View
     */
    public function getAttentionLabelingTasksAction(
        AnnoStationBundleModel\Organisation $organisation,
        HttpFoundation\Request $request,
        Model\Project $project
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);

        $offset = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit  = $request->query->has('limit') ? $request->query->getInt('limit') : null;

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
