<?php

namespace AnnoStationBundle\Controller\Api\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AppBundle\View;
use AnnoStationBundle\Service;
use FOS\RestBundle\Controller\Annotations as Rest;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AnnoStationBundle\Response;

/**
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project.report")
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
     * @var Service\Authorization
     */
    private $authorizationService;
    /**
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * Report constructor.
     *
     * @param Facade\Report         $reportFacade
     * @param AMQP\FacadeAMQP       $amqpFacade
     * @param Service\Authorization $authorizationService
     * @param AppFacade\User        $userFacade
     * @param Facade\Project        $projectFacade
     * @param Facade\Video          $videoFacade
     */
    public function __construct(
        Facade\Report $reportFacade,
        AMQP\FacadeAMQP $amqpFacade,
        Service\Authorization $authorizationService,
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade
    ) {
        $this->reportFacade         = $reportFacade;
        $this->amqpFacade           = $amqpFacade;
        $this->authorizationService = $authorizationService;
        $this->userFacade           = $userFacade;
        $this->projectFacade        = $projectFacade;
        $this->videoFacade          = $videoFacade;
    }

    /**
     * Return the report with the given id
     *
     * @Rest\Get("/{organisation}/project/{project}/report/{report}")
     *
     * @CheckPermissions({"canViewProjectReport"})
     *
     * @param Model\Project $project
     * @param Model\Report  $report
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getReportAction(Model\Project $project, Model\Report $report)
    {
        $this->authorizationService->denyIfProjectIsNotReadable($project);
        if ($report->getReportStatus() !== Model\Report::REPORT_STATUS_DONE) {
            throw new Exception\NotFoundHttpException();
        }

        $tasks = array();
        foreach ($this->projectFacade->getTasksByProject($project) as $task) {
            $video                 = $this->videoFacade->find($task->getVideoId());
            $tasks[$task->getId()] = array(
                'videoName'        => $video->getName(),
                'labelInstruction' => $task->getLabelInstruction(),
            );
        }

        $userIds = array_unique(
            array(
                $report->getProjectCreatedBy(),
                $report->getProjectMovedToInProgressBy(),
                $report->getProjectMovedToDoneBy(),
            )
        );

        $users = array();
        foreach ($this->userFacade->getUserByIds($userIds) as $user) {
            $users[$user->getId()] = $user->getUsername();
        }

        return View\View::create()->setData(
            [
                'result' => [
                    'report' => $report,
                    'tasks'  => $tasks,
                    'users'  => $users,
                ],
            ]
        );
    }

    /**
     * Return all reports for this project
     *
     * @CheckPermissions({"canViewProjectReport"})
     *
     * @Rest\Get("/{organisation}/project/{project}/report")
     *
     * @param Model\Project $project
     *
     * @return View\View
     */
    public function getReportsForProjectAction(Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotReadable($project);

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
     * @Rest\Post("/{organisation}/project/{project}/report")
     *
     * @param Model\Project $project
     *
     * @return \FOS\RestBundle\View\View
     */
    public function createNewReportForProjectAction(Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotReadable($project);

        $report = Model\Report::create($project);
        $this->reportFacade->save($report);
        $this->amqpFacade->addJob(new Jobs\Report($report->getId()));

        return View\View::create()->setData(['result' => $report]);
    }
}
