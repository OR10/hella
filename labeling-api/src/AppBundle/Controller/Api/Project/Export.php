<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
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
    private $projectExport;

    /**
     * @var Facade\VideoExport
     */
    private $videoExportFacade;

    /**
     * @param Facade\ProjectExport $projectExport
     * @param Facade\VideoExport $videoExportFacade
     * @param AMQP\FacadeAMQP $amqpFacade
     */
    public function __construct(
        Facade\ProjectExport $projectExport,
        Facade\VideoExport $videoExportFacade,
        AMQP\FacadeAMQP $amqpFacade
    )
    {
        $this->amqpFacade = $amqpFacade;
        $this->projectExport = $projectExport;
        $this->videoExportFacade = $videoExportFacade;
    }

    /**
     * @Rest\Get("/{project}/export")
     *
     * @param Model\Project $project
     * @return \FOS\RestBundle\View\View
     */
    public function listExportsAction(Model\Project $project)
    {
        $exports = $this->projectExport->findAllByProject($project);

        return View\View::create()->setData([
            'totalCount' => count($exports),
            'result'     => $exports,
        ]);
    }

    /**
     * @Rest\Get("/{project}/export/{projectExport}")
     *
     * @param Model\Project $project
     * @param Model\ProjectExport $projectExport
     * @return HttpFoundation\Response
     * @throws ProjectException\Csv
     */
    public function getExportAction(Model\Project $project, Model\ProjectExport $projectExport)
    {
        if ($project->getId() !== $projectExport->getProjectId()) {
            throw new Exception\NotFoundHttpException('Requested export is not valid for this project');
        }

        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new ProjectException\Csv(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        foreach($projectExport->getVideoExportIds() as $videoExportId) {
            $videoExport = $this->videoExportFacade->find($videoExportId);

            if (!$zip->addFromString($videoExport->getFilename(), $videoExport->getRawData())) {
                throw new ProjectException\Csv('Unable to add content to zip archive');
            }
        }
        $zip->close();

        $return = new HttpFoundation\Response(
            file_get_contents($zipFilename),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => sprintf(
                    'attachment; filename="%s"',
                    $projectExport->getFilename()
                ),
            ]
        );

        if (!unlink($zipFilename)) {
            throw new ProjectException\Csv(sprintf('Unable to remove temporary zip file at "%s"', $zipFilename));
        }

        return $return;
    }

    /**
     * @Rest\Post("/{project}/export/csv")
     *
     * @param Model\Project $project
     * @return HttpFoundation\Response
     *
     */
    public function getCsvExportAction(Model\Project $project)
    {
        $this->amqpFacade->addJob(new Jobs\ProjectCsvExporter($project->getId()));

        return View\View::create()
            ->setStatusCode(HttpFoundation\Response::HTTP_ACCEPTED)
            ->setData(['message' => 'Export started']);
    }
}
