<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use crosscan\WorkerPool\AMQP;
use AppBundle\Worker\Jobs;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AppBundle\Response;

/**
 * @Rest\Prefix("/api/project")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project.report")
 *
 * @CloseSession
 */
class Report extends Controller\Base
{
    /**
     * @var Facade\Report
     */
    private $reportFacade;
    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * Report constructor.
     * @param Facade\Report   $reportFacade
     * @param AMQP\FacadeAMQP $amqpFacade
     */
    public function __construct(Facade\Report $reportFacade, AMQP\FacadeAMQP $amqpFacade)
    {
        $this->reportFacade = $reportFacade;
        $this->amqpFacade   = $amqpFacade;
    }

    /**
     * Return the report with the given id
     *
     * @Rest\Get("/{project}/report/{report}")
     *
     * @CheckPermissions({"canViewProjectReport"})
     *
     * @param $report
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getReportAction(Model\Report $report)
    {
        if ($report->getReportStatus() !== Model\Report::REPORT_STATUS_DONE) {
            throw new Exception\NotFoundHttpException();
        }
        return View\View::create()->setData(['result' => $report]);
    }

    /**
     * Return all reports for this project
     *
     * @CheckPermissions({"canViewProjectReport"})
     *
     * @Rest\Get("/{project}/report")
     *
     * @param Model\Project $project
     * @return View\View
     */
    public function getReportsForProjectAction(Model\Project $project)
    {
        $reports = $this->reportFacade->findAllByProject($project)->toArray();

        return new View\View(
            new Response\SimpleReports($reports)
        );
    }

    /**
     * Create a new report for this project
     *
     * @CheckPermissions({"canViewProjectReport"})
     *
     * @Rest\Post("/{project}/report")
     *
     * @param Model\Project $project
     * @return \FOS\RestBundle\View\View
     */
    public function createNewReportForProjectAction(Model\Project $project)
    {
        $report = Model\Report::create($project);
        $this->reportFacade->save($report);
        $this->amqpFacade->addJob(new Jobs\Report($report->getId()));
        return View\View::create()->setData(['result' => $report]);
    }
}
