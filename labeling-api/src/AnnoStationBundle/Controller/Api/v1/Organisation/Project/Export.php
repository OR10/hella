<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project.export")
 *
 * @CloseSession
 */
class Export extends Controller\Base
{
    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Facade\ProjectExport
     */
    private $projectExportFacade;

    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @param Facade\ProjectExport  $projectExportFacade
     * @param AMQP\FacadeAMQP       $amqpFacade
     * @param Facade\Exporter       $exporterFacade
     * @param Service\Authorization $authorizationService
     * @param Storage\TokenStorage  $tokenStorage
     */
    public function __construct(
        Facade\ProjectExport $projectExportFacade,
        AMQP\FacadeAMQP $amqpFacade,
        Facade\Exporter $exporterFacade,
        Service\Authorization $authorizationService,
        Storage\TokenStorage $tokenStorage
    ) {
        $this->amqpFacade           = $amqpFacade;
        $this->projectExportFacade  = $projectExportFacade;
        $this->exporterFacade       = $exporterFacade;
        $this->authorizationService = $authorizationService;
        $this->tokenStorage         = $tokenStorage;
    }

    /**
     * @Rest\Get("/{organisation}/project/{project}/export")
     * @Annotations\CheckPermissions({"canExportProject"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listExportsAction(AnnoStationBundleModel\Organisation $organisation, Model\Project $project)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        $exports = $this->exporterFacade->findAllByProject($project);

        return View\View::create()->setData(
            [
                'totalCount' => count($exports),
                'result'     => $exports,
            ]
        );
    }

    /**
     * @Rest\Get("/{organisation}/project/{project}/export/{exportId}")
     * @Annotations\CheckPermissions({"canExportProject"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $exportId
     *
     * @return HttpFoundation\Response
     */
    public function getExportAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $exportId
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        $export = $this->exporterFacade->find($exportId);

        return $this->getExportContent($project, $export);
    }

    /**
     * @param Model\Project $project
     * @param Model\Export  $export
     *
     * @return HttpFoundation\Response
     */
    private function getExportContent(Model\Project $project, Model\Export $export)
    {
        if ($project->getId() !== $export->getProjectId()) {
            throw new Exception\NotFoundHttpException('Requested export is not valid for this project');
        }

        $attachments = $export->getAttachments();
        $attachment  = reset($attachments);

        return new HttpFoundation\Response(
            $attachment->getRawData(),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => sprintf(
                    'attachment; filename="export_%s.zip"',
                    $export->getDate()->format('Y-m-d_H-i-s')
                ),
            ]
        );
    }

    /**
     * @Rest\Post("/{organisation}/project/{project}/export/csv")
     * @Annotations\CheckPermissions({"canExportProject"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return HttpFoundation\Response
     */
    public function postCsvExportAction(AnnoStationBundleModel\Organisation $organisation, Model\Project $project)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotReadable($project);
        $user = $this->tokenStorage->getToken()->getUser();

        $export = new Model\Export($project, $user);
        $this->exporterFacade->save($export);
        foreach ($project->getAvailableExports() as $exportType) {
            switch ($exportType) {
                case 'legacy':
                    $this->amqpFacade->addJob(new Jobs\LegacyProjectToCsvExporter($export), WorkerPool\Facade::HIGH_PRIO);
                    break;
                case 'requirementsXml':
                    $this->amqpFacade->addJob(new Jobs\RequirementsProjectToXml($export), WorkerPool\Facade::HIGH_PRIO);
                    break;
            }
        }

        return View\View::create()
            ->setStatusCode(HttpFoundation\Response::HTTP_ACCEPTED)
            ->setData(['message' => 'Export started']);
    }
}
