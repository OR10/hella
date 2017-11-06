<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project.repair")
 *
 * @CloseSession
 */
class Repair extends Controller\Base
{
    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * Report constructor.
     *
     * @param AMQP\FacadeAMQP       $amqpFacade
     * @param Service\Authorization $authorizationService
     * @param Facade\Project        $projectFacade
     */
    public function __construct(
        AMQP\FacadeAMQP $amqpFacade,
        Service\Authorization $authorizationService,
        Facade\Project $projectFacade
    ) {
        $this->amqpFacade           = $amqpFacade;
        $this->authorizationService = $authorizationService;
        $this->projectFacade        = $projectFacade;
    }

    /**
     * @Rest\Post("/{organisation}/project/{project}/repair")
     * @Annotations\CheckPermissions({"canRepairProject"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return View\View
     */
    public function repairProjectAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        $tasks = $this->projectFacade->getTasksByProject($project);

        foreach ($tasks as $task) {
            $job = new Jobs\DeleteInvalidLtifLtAndLtgReferences($task->getId());
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return View\View::create()->setData(['result' => ['success' => true]]);
    }
}
