<?php

namespace AnnoStationBundle\Controller\Api\v1\Organisation;

use AnnoStationBundle\Helper\Project\ProjectFileHelper;
use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Exception;
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
use AnnoStationBundle\Controller\Api\v1\Organisation\Project;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.project_importer")
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
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Service\v1\Project\UploadProjectFileService
     */
    private $fileUploadService;

    /**
     * @var ProjectFileHelper
     */
    private $projectFileHelper;

    /**
     * ProjectImporter constructor.
     *
     *@param Storage\TokenStorage                         $tokenStorage
     * @param Service\ProjectImporter\Import              $projectImporter
     * @param string                                      $cacheDirectory
     * @param \cscntLogger                                $logger
     * @param Service\Authorization                       $authorizationService
     * @param Facade\Organisation                         $organisationFacade
     * @param Service\v1\Project\UploadProjectFileService $fileUploadService
     * @param ProjectFileHelper                           $projectFileHelper
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Service\ProjectImporter\Import $projectImporter,
        string $cacheDirectory,
        \cscntLogger $logger,
        Service\Authorization $authorizationService,
        Facade\Organisation $organisationFacade,
        Service\v1\Project\UploadProjectFileService $fileUploadService,
        ProjectFileHelper $projectFileHelper
    ) {
        $this->tokenStorage         = $tokenStorage;
        $this->projectImporter      = $projectImporter;
        $this->cacheDirectory       = $cacheDirectory;
        $this->loggerFacade         = new LoggerFacade($logger, self::class);
        $this->authorizationService = $authorizationService;
        $this->organisationFacade   = $organisationFacade;
        $this->fileUploadService    = $fileUploadService;
        $this->projectFileHelper    = $projectFileHelper;

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
     * @Rest\Post("/{organisation}/projectImport/{uploadId}")
     * @Annotations\CheckPermissions({"canUploadNewVideo"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $uploadId
     *
     * @return View\View
     * @throws Project\Exception\StorageLimitExceeded
     */
    public function uploadAction(
        HttpFoundation\Request $request,
        AnnoStationBundleModel\Organisation $organisation,
        $uploadId
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        if ($this->organisationFacade->isQuoteExceeded($organisation)) {
            throw new Project\Exception\StorageLimitExceeded($organisation);
        }

        $user                 = $this->tokenStorage->getToken()->getUser();
        $uploadCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $uploadId]);
        $chunkDirectory       = $uploadCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';
        $this->fileUploadService->ensureDirectoryExists($uploadCacheDirectory);
        $this->fileUploadService->ensureDirectoryExists($chunkDirectory);

        /** @var HttpFoundation\File\UploadedFile $uploadedFileChunk */
        $uploadedFileChunk = $request->files->get('file');
        $flowName = $this->projectFileHelper->removeSpecialCharacter($uploadedFileChunk->getClientOriginalName());
        $flowRequest       = new Flow\Request(
            $request->request->all(),
            [
                'error'    => $uploadedFileChunk->getError(),
                'name'     => $flowName,
                'type'     => $uploadedFileChunk->getClientMimeType(),
                'tmp_name' => $uploadedFileChunk->getPathname(),
                'size'     => $uploadedFileChunk->getSize(),
            ]
        );
        $config            = new Flow\Config(['tempDir' => $chunkDirectory]);
        $file              = new Flow\File($config, $flowRequest);
        $targetPath        = implode(DIRECTORY_SEPARATOR, [$uploadCacheDirectory, $flowName]);

        if (!$file->validateChunk()) {
            throw new HttpKernel\Exception\BadRequestHttpException('The uploaded chunk is invalid');
        }

        // There are some situations where the same previous request is aborted and send again from the ui.
        // However, the started php process will not be aborted which means the file may already be merged
        // and we have to check if the request may be a duplicate
        clearstatcache();

        $file->saveChunk();

        if ($file->validateFile()) {
            try {
                $file->save($targetPath);
                //validate files in zip
                $this->fileUploadService->uploadImportZip($flowRequest, $uploadCacheDirectory, $targetPath);
            } catch (\InvalidArgumentException $exception) {
                throw new HttpKernel\Exception\ConflictHttpException($exception->getMessage(), $exception);
            }
        }

        return new View\View(['result' => []]);
    }

    /**
     * @Rest\Post("/{organisation}/projectImport/{uploadId}/complete")
     * @Annotations\CheckPermissions({"canUploadNewVideo"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $uploadId
     *
     * @return View\View
     */
    public function uploadCompleteAction(
        HttpFoundation\Request $request,
        AnnoStationBundleModel\Organisation $organisation,
        $uploadId
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        clearstatcache();
        $user                         = $this->tokenStorage->getToken()->getUser();
        $uploadCacheDirectory         = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $uploadId]);
        $overwriteTaskConfigurationId = $request->request->get('taskConfigurationId');
        $deactivateSha256             = $request->request->get('deactivateSha256', false);
        $tasks                        = [];

        try {
            foreach (glob(sprintf('%s%s*.xml', $uploadCacheDirectory, DIRECTORY_SEPARATOR)) as $filePath) {
                $tasks = array_merge(
                    $this->projectImporter->importXml($filePath, $organisation, $user, $overwriteTaskConfigurationId, $deactivateSha256, $uploadCacheDirectory),
                    $tasks
                );
            }
        } catch (\Exception $exception) {
            return new View\View(
                [
                    'result' => [
                        'error' => [
                            'message' => $exception->getMessage()
                        ]
                    ],
                ]
            );
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
}
