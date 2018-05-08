<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Controller\Api\v1\Organisation\Project\Exception as ProjectException;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use AppBundle\Model;
use AppBundle\View;
use crosscan\Logger\Facade\LoggerFacade;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use Flow;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Version("v1")
 * @Rest\Route("/api/{version}/organisation", service="annostation.labeling_api.controller.api.organisation.project.batch_upload")
 *
 * @CloseSession
 */
class BatchUpload extends Controller\Base
{
    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @var Service\VideoImporter
     */
    private $videoImporter;

    /**
     * @var Service\TaskCreator
     */
    private $taskCreator;

    /**
     * @var LoggerFacade
     */
    private $loggerFacade;

    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Service\v1\Project\BatchUploadService
     */
    private $batchService;

    /**
     * BatchUpload constructor.
     *
     * @param Storage\TokenStorage                  $tokenStorage
     * @param Facade\Project                        $projectFacade
     * @param Facade\Video                          $videoFacade
     * @param Facade\LabelingTask                   $taskFacade
     * @param Facade\Organisation                   $organisationFacade
     * @param AMQP\FacadeAMQP                       $amqpFacade
     * @param Service\VideoImporter                 $videoImporter
     * @param Service\TaskCreator                   $taskCreator
     * @param string                                $cacheDirectory
     * @param \cscntLogger                          $logger
     * @param Service\Authorization                 $authorizationService
     * @param Service\v1\Project\BatchUploadService $batchService
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $taskFacade,
        Facade\Organisation $organisationFacade,
        AMQP\FacadeAMQP $amqpFacade,
        Service\VideoImporter $videoImporter,
        Service\TaskCreator $taskCreator,
        string $cacheDirectory,
        \cscntLogger $logger,
        Service\Authorization $authorizationService,
        Service\v1\Project\BatchUploadService $batchService
    ) {
        $this->tokenStorage         = $tokenStorage;
        $this->projectFacade        = $projectFacade;
        $this->videoFacade          = $videoFacade;
        $this->taskFacade           = $taskFacade;
        $this->videoImporter        = $videoImporter;
        $this->taskCreator          = $taskCreator;
        $this->cacheDirectory       = $cacheDirectory;
        $this->loggerFacade         = new LoggerFacade($logger, self::class);
        $this->authorizationService = $authorizationService;
        $this->organisationFacade   = $organisationFacade;
        $this->amqpFacade           = $amqpFacade;
        $this->batchService         = $batchService;

        clearstatcache();

        // another request may create the directory between checking for existence and attempt to create the directory,
        // so we double check the existence here and disable the internal error for creating the directory
        if (!is_dir($this->cacheDirectory) && !@mkdir($this->cacheDirectory)) {
            clearstatcache();
            if (!is_dir($this->cacheDirectory)) {
                throw new \RuntimeException(sprintf('Unable to create cache directory: %s', $this->cacheDirectory));
            }
        }
    }

    /**
     * @Rest\Post("/{organisation}/project/batchUpload/{project}")
     * @Annotations\CheckPermissions({"canUploadNewVideo"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     * @throws Exception\StorageLimitExceeded
     */
    public function uploadAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);
        $this->denyIfProjectIsNotTodo($project);

        if ($this->organisationFacade->isQuoteExceeded($organisation)) {
            throw new ProjectException\StorageLimitExceeded($organisation);
        }

        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->getId() !== $project->getUserId()) {
            throw new HttpKernel\Exception\AccessDeniedHttpException('You are not allowed to upload videos here');
        }
        //uploading file
        $this->batchService->uploadFile($request, $organisation, $user, $project);

        return new View\View(['result' => []]);
    }

    /**
     * @Rest\Post("/{organisation}/project/batchUpload/{project}/complete")
     * @Annotations\CheckPermissions({"canUploadNewVideo"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @param HttpFoundation\Request              $request
     *
     * @return View\View
     * @throws \Exception
     */
    public function uploadCompleteAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        HttpFoundation\Request $request
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);
        $this->denyIfProjectIsNotTodo($project);

        // show quote exceed error for all files
        if ($this->organisationFacade->isQuoteExceeded($organisation)) {
            return new View\View(['result' => ['error' => ['message' => 'Organization storage quote limit exceed']]]);
        }

        clearstatcache();

        $tasks                        = [];
        $videosWithoutCalibrationData = [];

        $videoIdsWithExistingTasks = array_map(
            function (Model\LabelingTask $task) {
                return $task->getVideoId();
            },
            $this->taskFacade->findByVideoIds($project->getVideoIds())
        );

        $videoIds = array_diff($project->getVideoIds(), $videoIdsWithExistingTasks);

        if (!empty($videoIds)) {
            $user   = $this->tokenStorage->getToken()->getUser();
            $videos = $this->videoFacade->findById($videoIds);
            foreach ($videos as $video) {
                try {
                    $tasks = array_merge($tasks, $this->taskCreator->createTasks($project, $video, $user));
                } catch (ProjectException\Missing3dVideoCalibrationData $exception) {
                    $videosWithoutCalibrationData[] = $video;
                } catch (\Exception $exception) {
                    $this->loggerFacade->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
                    throw $exception;
                }
            }
        }

        if (!$request->query->has('skipProjectCalculation')) {
            $job = new Jobs\CalculateProjectDiskSize($project->getId());
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return new View\View(
            [
                'result' => [
                    'taskIds' => array_map(
                        function (Model\LabelingTask $task) {
                            return $task->getId();
                        },
                        $tasks
                    ),
                    'missing3dVideoCalibrationData' => array_map(
                        function (Model\Video $video) {
                            return $video->getName();
                        },
                        $videosWithoutCalibrationData
                    ),
                ],
            ]
        );
    }

    /**
     * @param Model\Project $project
     */
    private function denyIfProjectIsNotTodo(Model\Project $project)
    {
        if ($project->getStatus() !== Model\Project::STATUS_TODO) {
            throw new HttpKernel\Exception\AccessDeniedHttpException(
                'Uploading files is only possible for projects in todo'
            );
        }
    }
}
