<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool\AMQP;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use AppBundle\Controller\Api\Project\Exception as ProjectException;

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
     * @var Facade\VideoExport
     */
    private $videoExportFacade;

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
     * @param Facade\VideoExport    $videoExportFacade
     * @param AMQP\FacadeAMQP       $amqpFacade
     * @param Facade\Exporter       $exporterFacade
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Facade\ProjectExport $projectExportFacade,
        Facade\VideoExport $videoExportFacade,
        AMQP\FacadeAMQP $amqpFacade,
        Facade\Exporter $exporterFacade,
        Service\Authorization $authorizationService
    ) {
        $this->amqpFacade           = $amqpFacade;
        $this->projectExportFacade  = $projectExportFacade;
        $this->videoExportFacade    = $videoExportFacade;
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

        $availableExports = $project->getAvailableExports();
        $exporter         = reset($availableExports);
        if ($exporter === 'genericXml') {
            $exports = $this->exporterFacade->findAllByProject($project);
        } else {
            $exports = $this->projectExportFacade->findAllByProject($project);
        }

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

        $availableExports = $project->getAvailableExports();
        $exporter         = reset($availableExports);

        if ($exporter === 'genericXml') {
            $export = $this->exporterFacade->find($exportId);

            return $this->getGenericXmlZipContent($project, $export);
        } else {
            $projectExport = $this->projectExportFacade->find($exportId);

            return $this->getLegacyZipContent($project, $projectExport);
        }
    }

    /**
     * @param Model\Project $project
     * @param Model\Export  $export
     *
     * @return HttpFoundation\Response
     */
    private function getGenericXmlZipContent(Model\Project $project, Model\Export $export)
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
     * @param Model\Project       $project
     * @param Model\ProjectExport $projectExport
     *
     * @return HttpFoundation\Response
     *
     * @throws ProjectException\Csv
     */
    private function getLegacyZipContent(Model\Project $project, Model\ProjectExport $projectExport)
    {
        if ($project->getId() !== $projectExport->getProjectId()) {
            throw new Exception\NotFoundHttpException('Requested export is not valid for this project');
        }

        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new ProjectException\Csv(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        $videoExportIds = $projectExport->getVideoExportIds();
        if (empty($videoExportIds)) {
            $zip->addEmptyDir('.');
        }
        foreach ($videoExportIds as $videoExportId) {
            $videoExport = $this->videoExportFacade->find($videoExportId);

            if (!$zip->addFromString($videoExport->getFilename(), $videoExport->getRawData())) {
                throw new ProjectException\Csv('Unable to add content to zip archive');
            }
        }
        $zip->close();

        $response = new HttpFoundation\Response(
            file_get_contents($zipFilename),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => sprintf(
                    'attachment; filename="%s"',
                    $projectExport->getFilename()
                ),
            ]
        );

        if (!unlink($zipFilename)) {
            throw new ProjectException\Csv(sprintf('Unable to remove temporary zip file at "%s"', $zipFilename));
        }

        return $response;
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

        foreach ($project->getAvailableExports() as $exportType) {
            switch ($exportType) {
                case 'legacy':
                    $this->amqpFacade->addJob(new Jobs\LegacyProjectToCsvExporter($project->getId()));
                    break;
                case 'genericXml':
                    $this->amqpFacade->addJob(new Jobs\GenericXmlProjectToCsvExporter($project->getId()));
                    break;
            }
        }

        return View\View::create()
            ->setStatusCode(HttpFoundation\Response::HTTP_ACCEPTED)
            ->setData(['message' => 'Export started']);
    }
}
