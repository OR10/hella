<?php

namespace AppBundle\Controller\Api\Project;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\View;
use crosscan\Logger\Facade\LoggerFacade;
use Flow;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Bridge\Twig;
use Symfony\Component\HttpFoundation;
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
     * @var Twig\TwigEngine
     */
    private $twigEngine;

    /**
     * @var LoggerFacade
     */
    private $loggerFacade;

    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * @param Storage\TokenStorage  $tokenStorage
     * @param Facade\Project        $projectFacade
     * @param Facade\Video          $videoFacade
     * @param Facade\LabelingTask   $taskFacade
     * @param Service\VideoImporter $videoImporter
     * @param Service\TaskCreator   $taskCreator
     * @param Twig\TwigEngine       $twigEngine
     * @param string                $cacheDirectory
     * @param \cscntLogger          $logger
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $taskFacade,
        Service\VideoImporter $videoImporter,
        Service\TaskCreator $taskCreator,
        Twig\TwigEngine $twigEngine,
        string $cacheDirectory,
        \cscntLogger $logger
    ) {
        $this->tokenStorage   = $tokenStorage;
        $this->projectFacade  = $projectFacade;
        $this->videoFacade    = $videoFacade;
        $this->taskFacade     = $taskFacade;
        $this->videoImporter  = $videoImporter;
        $this->taskCreator    = $taskCreator;
        $this->twigEngine     = $twigEngine;
        $this->cacheDirectory = $cacheDirectory;
        $this->loggerFacade   = new LoggerFacade($logger, self::class);

        if (!is_dir($this->cacheDirectory) && !mkdir($this->cacheDirectory)) {
            throw new \RuntimeException(sprintf('Unable to create cache directory: %s', $this->cacheDirectory));
        }
    }

    /**
     * @Rest\Post("/{project}")
     *
     * @param Model\Project $project
     *
     * @return View\View
     */
    public function uploadAction(Model\Project $project)
    {
        $projectCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $project->getId()]);
        $chunkDirectory        = $projectCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->ensureDirectoryExists($projectCacheDirectory);
        $this->ensureDirectoryExists($chunkDirectory);

        $request = new Flow\Request();
        $config  = new Flow\Config(['tempDir' => $chunkDirectory]);
        $file    = new Flow\File($config, $request);

        if (!$file->validateChunk()) {
            throw new HttpKernel\Exception\BadRequestHttpException();
        }

        $file->saveChunk();

        if ($file->validateFile()) {
            $targetPath = implode(DIRECTORY_SEPARATOR, [$projectCacheDirectory, $request->getFileName()]);
            try {
                $file->save($targetPath);

                if ($this->isVideoFile($request->getFileName())) {
                    // for now, we always use compressed images
                    $this->videoImporter->importVideo($project, $targetPath, false);
                } elseif ($this->isCalibrationFile($request->getFileName())) {
                    $this->videoImporter->importCalibrationData($project, $targetPath);
                } else {
                    throw new HttpKernel\Exception\BadRequestHttpException(
                        sprintf('Invalid file: %s', $request->getFileName())
                    );
                }
            } finally {
                // we ignore errors here since this directory will be cleaned up periodically
                @unlink($targetPath);
            }
        }

        return new View\View();
    }

    /**
     * @Rest\Post("/{project}/complete")
     *
     * @param Model\Project $project
     *
     * @return View\View
     *
     * @throws \Exception
     */
    public function uploadCompleteAction(Model\Project $project)
    {
        $tasks = [];

        $videoIds = array_diff(
            $project->getVideoIds(),
            array_map(
                function (Model\LabelingTask $task) {
                    return $task->getVideoId();
                },
                $this->taskFacade->findByVideoIds($project->getVideoIds())
            )
        );

        try {
            $user = $this->tokenStorage->getToken()->getUser();

            foreach ($videoIds as $videoId) {
                $video = $this->videoFacade->find($videoId);
                if ($video === null) {
                    throw new HttpKernel\Exception\BadRequestHttpException(sprintf('Video not found: %s', $videoId));
                }

                $tasks = array_merge($tasks, $this->taskCreator->createTasks($user, $project, $video));
            }
        } catch (\Exception $exception) {
            $this->loggerFacade->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
            throw $exception;
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
        if (!is_dir($directory)) {
            if (!mkdir($directory)) {
                throw new \RuntimeException(sprintf('Failed to create directory: %s', $directory));
            }
        }
    }
}
