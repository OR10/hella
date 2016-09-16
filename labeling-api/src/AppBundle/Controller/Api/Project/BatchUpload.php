<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\View;
use crosscan\Logger\Facade\LoggerFacade;
use Flow;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Bridge\Twig;
use Symfony\Component\HttpKernel;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Route("/api/project/batchUpload", service="annostation.labeling_api.controller.api.project.batch_upload")
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
     * @param Storage\TokenStorage  $tokenStorage
     * @param Facade\Project        $projectFacade
     * @param Facade\Video          $videoFacade
     * @param Facade\LabelingTask   $taskFacade
     * @param Service\VideoImporter $videoImporter
     * @param Service\TaskCreator   $taskCreator
     * @param string                $cacheDirectory
     * @param \cscntLogger          $logger
     * @param Service\Authorization $authorizationService
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $taskFacade,
        Service\VideoImporter $videoImporter,
        Service\TaskCreator $taskCreator,
        string $cacheDirectory,
        \cscntLogger $logger,
        Service\Authorization $authorizationService
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
     * @Rest\Post("/{project}")
     *
     * @CheckPermissions({"canUploadNewVideo"})
     *
     * @param Model\Project $project
     *
     * @return View\View
     */
    public function uploadAction(Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotWritable($project);
        $this->denyIfProjectIsDone($project);

        $user                  = $this->tokenStorage->getToken()->getUser();
        $projectCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $project->getId()]);
        $chunkDirectory        = $projectCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->ensureDirectoryExists($projectCacheDirectory);
        $this->ensureDirectoryExists($chunkDirectory);

        $request    = new Flow\Request();
        $config     = new Flow\Config(['tempDir' => $chunkDirectory]);
        $file       = new Flow\File($config, $request);
        $targetPath = implode(DIRECTORY_SEPARATOR, [$projectCacheDirectory, $request->getFileName()]);

        if (!$file->validateChunk()) {
            throw new HttpKernel\Exception\BadRequestHttpException();
        }

        // There are some situations where the same previous request is aborted and send again from the ui.
        // However, the started php process will not be aborted which means the file may already be merged
        // and we have to check if the request may be a duplicate
        clearstatcache();

        if ($this->isVideoFile($request->getFileName())) {
            if ($project->hasVideo($request->getFileName())) {
                throw new HttpKernel\Exception\ConflictHttpException(
                    sprintf('Video already exists in project: %s', $request->getFileName())
                );
            }
        } elseif ($this->isCalibrationFile($request->getFileName())) {
            if ($project->hasCalibrationData($request->getFileName())) {
                throw new HttpKernel\Exception\ConflictHttpException(
                    sprintf('Calibration data already exists in project: %s', $request->getFileName())
                );
            }
        } else {
            throw new HttpKernel\Exception\BadRequestHttpException(
                sprintf('Invalid file: %s', $request->getFileName())
            );
        }

        $file->saveChunk();

        if ($file->validateFile()) {
            try {
                $file->save($targetPath);

                if ($this->isVideoFile($request->getFileName())) {
                    // for now, we always use compressed images
                    $this->videoImporter->importVideo($project, basename($targetPath), $targetPath, false);
                } elseif ($this->isCalibrationFile($request->getFileName())) {
                    $this->videoImporter->importCalibrationData($project, $targetPath);
                } else {
                    throw new HttpKernel\Exception\BadRequestHttpException(
                        sprintf('Invalid file: %s', $request->getFileName())
                    );
                }
            } catch (\InvalidArgumentException $exception) {
                throw new HttpKernel\Exception\ConflictHttpException($exception->getMessage(), $exception);
            } finally {
                // we ignore errors here since this directory will be cleaned up periodically anyway
                @unlink($targetPath);
            }
        }

        return new View\View(['result' => []]);
    }

    /**
     * @Rest\Post("/{project}/complete")
     *
     * @CheckPermissions({"canUploadNewVideo"})
     *
     * @param Model\Project $project
     *
     * @return View\View
     *
     * @throws \Exception
     */
    public function uploadCompleteAction(Model\Project $project)
    {
        $this->authorizationService->denyIfProjectIsNotWritable($project);
        $this->denyIfProjectIsDone($project);

        clearstatcache();

        $tasks = [];

        $videoIdsWithExistingTasks = array_map(
            function (Model\LabelingTask $task) {
                return $task->getVideoId();
            },
            $this->taskFacade->findByVideoIds($project->getVideoIds())
        );

        $videoIds = array_diff($project->getVideoIds(), $videoIdsWithExistingTasks);

        if (!empty($videoIds)) {
            try {
                $user   = $this->tokenStorage->getToken()->getUser();
                $videos = $this->videoFacade->findById($videoIds);

                foreach ($videos as $video) {
                    $tasks = array_merge($tasks, $this->taskCreator->createTasks($project, $video, $user));
                }
            } catch (\Exception $exception) {
                $this->loggerFacade->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
                throw $exception;
            }
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
                ],
            ]
        );
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    private function isVideoFile(string $filename)
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['avi', 'mpg', 'mpeg', 'mp4']);
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    private function isCalibrationFile(string $filename)
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['csv']);
    }

    /**
     * @param string $directory
     */
    private function ensureDirectoryExists(string $directory)
    {
        clearstatcache();
        if (!is_dir($directory) && !@mkdir($directory, 0777, true)) {
            if (!is_dir($directory)) {
                throw new \RuntimeException(sprintf('Failed to create directory: %s', $directory));
            }
        }
    }

    /**
     * @param Model\Project $project
     */
    private function denyIfProjectIsDone(Model\Project $project)
    {
        if ($project->getStatus() === Model\Project::STATUS_DONE) {
            throw new HttpKernel\Exception\AccessDeniedHttpException(
                'Uploading files for a done project is not allowed'
            );
        }
    }
}
