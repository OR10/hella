<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation\Project;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Controller\Api\v1\Organisation\Project\Exception as ProjectException;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AppBundle\View;
use crosscan\Logger\Facade\LoggerFacade;
use Flow;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
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
     * @param Storage\TokenStorage  $tokenStorage
     * @param Facade\Project        $projectFacade
     * @param Facade\Video          $videoFacade
     * @param Facade\LabelingTask   $taskFacade
     * @param Facade\Organisation   $organisationFacade
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
        Facade\Organisation $organisationFacade,
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
        $this->organisationFacade  = $organisationFacade;

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
     *
     * @CheckPermissions({"canUploadNewVideo"})
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

        $user                  = $this->tokenStorage->getToken()->getUser();
        $projectCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $project->getId()]);
        $chunkDirectory        = $projectCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->ensureDirectoryExists($projectCacheDirectory);
        $this->ensureDirectoryExists($chunkDirectory);

        /** @var HttpFoundation\File\UploadedFile $uploadedFileChunk */
        $uploadedFileChunk = $request->files->get('file');
        $flowRequest       = new Flow\Request(
            $request->request->all(),
            [
                'error'    => $uploadedFileChunk->getError(),
                'name'     => $uploadedFileChunk->getClientOriginalName(),
                'type'     => $uploadedFileChunk->getClientMimeType(),
                'tmp_name' => $uploadedFileChunk->getPathname(),
                'size'     => $uploadedFileChunk->getSize(),
            ]
        );
        $config            = new Flow\Config(['tempDir' => $chunkDirectory]);
        $file              = new Flow\File($config, $flowRequest);
        $targetPath        = implode(DIRECTORY_SEPARATOR, [$projectCacheDirectory, $flowRequest->getFileName()]);

        if (!$file->validateChunk()) {
            throw new HttpKernel\Exception\BadRequestHttpException();
        }

        // There are some situations where the same previous request is aborted and send again from the ui.
        // However, the started php process will not be aborted which means the file may already be merged
        // and we have to check if the request may be a duplicate
        clearstatcache();

        if ($this->isVideoFile($flowRequest->getFileName())) {
            if ($project->hasVideo($flowRequest->getFileName())) {
                throw new HttpKernel\Exception\ConflictHttpException(
                    sprintf('Video already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->isAdditionalFrameNumberMappingFile($flowRequest->getFileName())) {
            if ($project->hasAdditionalFrameNumberMapping($flowRequest->getFileName())) {
                throw new HttpKernel\Exception\ConflictHttpException(
                    sprintf('FrameMapping data already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->isCalibrationFile($flowRequest->getFileName())) {
            if ($project->hasCalibrationData($flowRequest->getFileName())) {
                throw new HttpKernel\Exception\ConflictHttpException(
                    sprintf('Calibration data already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->isImageFile($flowRequest->getFileName())) {
            if ($project->hasVideo($flowRequest->getFileName())) {
                throw new HttpKernel\Exception\ConflictHttpException(
                    sprintf('Image already exists in project (either as video or image file): %s', $flowRequest->getFileName())
                );
            }
        } else {
            throw new HttpKernel\Exception\BadRequestHttpException(
                sprintf('Invalid file: %s', $flowRequest->getFileName())
            );
        }

        $file->saveChunk();

        if ($file->validateFile()) {
            try {
                $file->save($targetPath);

                if ($this->isVideoFile($flowRequest->getFileName())) {
                    // for now, we always use compressed images
                    $this->videoImporter->importVideo(
                        $organisation,
                        $project,
                        basename($targetPath),
                        $targetPath,
                        false
                    );
                } elseif ($this->isImageFile($flowRequest->getFileName())) {
                    // Image compression is determined by their input image type
                    // PNG -> lossless, jpeg -> compressed.
                    $this->videoImporter->importImage(
                        $organisation,
                        $project,
                        basename($targetPath),
                        $targetPath
                    );
                } elseif ($this->isAdditionalFrameNumberMappingFile($flowRequest->getFileName())) {
                    $this->videoImporter->importAdditionalFrameNumberMapping(
                        $organisation,
                        $project,
                        $targetPath
                    );
                } elseif ($this->isCalibrationFile($flowRequest->getFileName())) {
                    $this->videoImporter->importCalibrationData($organisation, $project, $targetPath);
                } else {
                    throw new HttpKernel\Exception\BadRequestHttpException(
                        sprintf('Invalid file: %s', $flowRequest->getFileName())
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
     * @Rest\Post("/{organisation}/project/batchUpload/{project}/complete")
     *
     * @CheckPermissions({"canUploadNewVideo"})
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return View\View
     * @throws \Exception
     */
    public function uploadCompleteAction(AnnoStationBundleModel\Organisation $organisation, Model\Project $project)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        $this->authorizationService->denyIfProjectIsNotAssignedToOrganisation($organisation, $project);
        $this->authorizationService->denyIfProjectIsNotWritable($project);
        $this->denyIfProjectIsNotTodo($project);

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
     * @param string $filename
     *
     * @return bool
     */
    private function isAdditionalFrameNumberMappingFile(string $filename)
    {
        preg_match('/\.(frame-index\.csv)$/', $filename, $matches);

        return !empty($matches);
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    private function isImageFile(string $filename): bool
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['jpg', 'png']);
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
    private function denyIfProjectIsNotTodo(Model\Project $project)
    {
        if ($project->getStatus() !== Model\Project::STATUS_TODO) {
            throw new HttpKernel\Exception\AccessDeniedHttpException(
                'Uploading files is only possible for projects in todo'
            );
        }
    }
}
