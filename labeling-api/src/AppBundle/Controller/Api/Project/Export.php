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
     * @param Facade\ProjectExport $projectExport
     * @param AMQP\FacadeAMQP $amqpFacade
     */
    public function __construct(
        Facade\ProjectExport $projectExport,
        AMQP\FacadeAMQP $amqpFacade
    )
    {
        $this->amqpFacade = $amqpFacade;
        $this->projectExport = $projectExport;
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
     */
    public function getExportAction(Model\Project $project, Model\ProjectExport $projectExport)
    {
        if ($project->getId() !== $projectExport->getProjectId()) {
            throw new Exception\NotFoundHttpException('Requested export is not valid for this project');
        }

        return new HttpFoundation\Response(
            $projectExport->getRawData(),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => $projectExport->getContentType(),
                'Content-Disposition' => sprintf(
                    'attachment; filename="%s"',
                    $projectExport->getFilename()
                ),
            ]
        );
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
