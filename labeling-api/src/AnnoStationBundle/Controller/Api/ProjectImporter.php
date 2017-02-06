<?php

namespace AnnoStationBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Controller\Api\Project\Exception as ProjectException;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;
use AppBundle\View;
use crosscan\Logger\Facade\LoggerFacade;
use Flow;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/projectImport")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project_importer")
 *
 * @CloseSession
 */
class ProjectImporter extends Controller\Base
{

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

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
     * @var Service\ProjectImporter\Import
     */
    private $projectImporter;

    /**
     * @param Storage\TokenStorage           $tokenStorage
     * @param Service\ProjectImporter\Import $projectImporter
     * @param string                         $cacheDirectory
     * @param \cscntLogger                   $logger
     * @param Service\Authorization          $authorizationService
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Service\ProjectImporter\Import $projectImporter,
        string $cacheDirectory,
        \cscntLogger $logger,
        Service\Authorization $authorizationService
    ) {
        $this->tokenStorage         = $tokenStorage;
        $this->projectImporter      = $projectImporter;
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
     * @Rest\Post("/{uploadId}")
     *
     * @CheckPermissions({"canUploadNewVideo"})
     *
     * @param HttpFoundation\Request $request
     * @param                        $uploadId
     *
     * @return View\View
     */
    public function uploadAction(HttpFoundation\Request $request, $uploadId)
    {
        $user                 = $this->tokenStorage->getToken()->getUser();
        $uploadCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $uploadId]);
        $chunkDirectory       = $uploadCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->ensureDirectoryExists($uploadCacheDirectory);
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
        $targetPath        = implode(DIRECTORY_SEPARATOR, [$uploadCacheDirectory, $flowRequest->getFileName()]);

        if (!$file->validateChunk()) {
            throw new HttpKernel\Exception\BadRequestHttpException();
        }

        // There are some situations where the same previous request is aborted and send again from the ui.
        // However, the started php process will not be aborted which means the file may already be merged
        // and we have to check if the request may be a duplicate
        clearstatcache();

        $file->saveChunk();

        if ($file->validateFile()) {
            try {
                $file->save($targetPath);
            } catch (\InvalidArgumentException $exception) {
                throw new HttpKernel\Exception\ConflictHttpException($exception->getMessage(), $exception);
            }
        }

        return new View\View(['result' => []]);
    }

    /**
     * @Rest\Post("/{uploadId}/complete")
     *
     * @CheckPermissions({"canUploadNewVideo"})
     *
     * @param $uploadId
     *
     * @return View\View
     */
    public function uploadCompleteAction($uploadId)
    {
        clearstatcache();
        $user                 = $this->tokenStorage->getToken()->getUser();
        $uploadCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $uploadId]);

        $tasks = [];
        foreach (glob(sprintf('%s%s*.xml', $uploadCacheDirectory, DIRECTORY_SEPARATOR)) as $filePath) {
            $tasks = array_merge($this->projectImporter->importXml($filePath, $user), $tasks);
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
                    'missing3dVideoCalibrationData' => [],
                ],
            ]
        );
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
}