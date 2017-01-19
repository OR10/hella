<?php

namespace AnnoStationBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool\AMQP;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use AnnoStationBundle\Controller\Api\Project\Exception as ProjectException;

/**
 * @Rest\Prefix("/api/project")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project.export")
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
     * @param Facade\ProjectExport  $projectExportFacade
     * @param AMQP\FacadeAMQP       $amqpFacade
     * @param Facade\Exporter       $exporterFacade
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Facade\ProjectExport $projectExportFacade,
        AMQP\FacadeAMQP $amqpFacade,
        Facade\Exporter $exporterFacade,
        Service\Authorization $authorizationService
    ) {
        $this->amqpFacade           = $amqpFacade;
        $this->projectExportFacade  = $projectExportFacade;
        $this->exporterFacade       = $exporterFacade;
        $this->authorizationService = $authorizationService;
    }

    /**
     * @Rest\Get("/{project}/export")
     *
     * @CheckPermissions({"canExportProject"})
     *
     * @param Model\Project $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listExportsAction(Model\Project $project)
    {
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
     * @Rest\Get("/{project}/export/{exportId}")
     *
     * @CheckPermissions({"canExportProject"})
     *
     * @param Model\Project $project
     * @param string        $exportId
     *
     * @return HttpFoundation\Response
     *
     * @throws ProjectException\Csv
     */
    public function getExportAction(Model\Project $project, string $exportId)
    {
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
     * @Rest\Post("/{project}/export/csv")
     *
     * @CheckPermissions({"canExportProject"})
     *
     * @param Model\Project $project
     *
     * @return HttpFoundation\Response
     *
     */
    public function postCsvExportAction(Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        $export = new Model\Export($project);
        $this->exporterFacade->save($export);
        foreach ($project->getAvailableExports() as $exportType) {
            switch ($exportType) {
                case 'legacy':
                    $this->amqpFacade->addJob(new Jobs\LegacyProjectToCsvExporter($export));
                    break;
                case 'genericXml':
                    $this->amqpFacade->addJob(new Jobs\GenericXmlProjectToCsvExporter($export));
                    break;
                case 'requirementsXml':
                    $this->amqpFacade->addJob(new Jobs\RequirementsProjectToXml($export));
                    break;
            }
        }

        return View\View::create()
            ->setStatusCode(HttpFoundation\Response::HTTP_ACCEPTED)
            ->setData(['message' => 'Export started']);
    }
}
