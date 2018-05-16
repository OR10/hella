<?php

namespace AnnoStationBundle\Service\v1\Project;

use AnnoStationBundle\Service\VideoImporter;
use AppBundle\Exception;
use Flow\Config;
use Flow\File;
use Flow\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class BatchUploadService
{


    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * @var VideoImporter
     */
    private $videoImporter;

    /**
     * @var int
     */
    private $zipFilesCount = 0;

    /**
     * BatchUploadService constructor.
     *
     * @param string                    $cacheDirectory
     * @param VideoImporter             $videoImporter
     * @param UploadProjectFileService  $fileUploadService
     */
    public function __construct(
        string $cacheDirectory,
        VideoImporter $videoImporter,
        UploadProjectFileService $fileUploadService
    )
    {
        $this->cacheDirectory    = $cacheDirectory;
        $this->videoImporter     = $videoImporter;
        $this->fileUploadService = $fileUploadService;
    }


    /**
     * uploading file
     * @param $organisation
     * @param $user
     * @param $request
     * @return string[]|null
     */
    public function uploadFile($request, $organisation, $user, $project)
    {
        $projectCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $project->getId()]);
        $chunkDirectory        = $projectCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->fileUploadService->ensureDirectoryExists($projectCacheDirectory);
        $this->fileUploadService->ensureDirectoryExists($chunkDirectory);

        /** @var UploadedFile $uploadedFileChunk */
        $uploadedFileChunk = $request->files->get('file');
        $lossless = $request->query->get('lossless');
        $lossless = (isset($lossless)) ? ($lossless === 'true') ? true : false : false;

        $flowRequest       = new Request(
            $request->request->all(),
            [
                'error'    => $uploadedFileChunk->getError(),
                'name'     => $uploadedFileChunk->getClientOriginalName(),
                'type'     => $uploadedFileChunk->getClientMimeType(),
                'tmp_name' => $uploadedFileChunk->getPathname(),
                'size'     => $uploadedFileChunk->getSize(),
            ]
        );
        $config            = new Config(['tempDir' => $chunkDirectory]);
        $file              = new File($config, $flowRequest);
        $targetPath        = implode(DIRECTORY_SEPARATOR, [$projectCacheDirectory, $flowRequest->getFileName()]);

        if (!$file->validateChunk()) {
            throw new BadRequestHttpException();
        }

        // There are some situations where the same previous request is aborted and send again from the ui.
        // However, the started php process will not be aborted which means the file may already be merged
        // and we have to check if the request may be a duplicate
        clearstatcache();

        if ($this->fileUploadService->isVideoFile($flowRequest->getFileName())) {
            if ($project->hasVideo($flowRequest->getFileName())) {

                throw new ConflictHttpException(
                    sprintf('Video/Zip already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->fileUploadService->isAdditionalFrameNumberMappingFile($flowRequest->getFileName())) {
            if ($project->hasAdditionalFrameNumberMapping($flowRequest->getFileName())) {
                throw new ConflictHttpException(
                    sprintf('FrameMapping data already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->fileUploadService->isCalibrationFile($flowRequest->getFileName())) {
            if ($project->hasCalibrationData($flowRequest->getFileName())) {
                throw new ConflictHttpException(
                    sprintf('Calibration data already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->fileUploadService->isImageFile($flowRequest->getFileName())) {
            if ($project->hasVideo($flowRequest->getFileName())) {
                throw new ConflictHttpException(
                    sprintf('Image already exists in project (either as video or image file): %s', $flowRequest->getFileName())
                );
            }
        } else {
            if(!$this->fileUploadService->isZipFile($flowRequest->getFileName())) {
                throw new BadRequestHttpException(
                    sprintf('Invalid file: %s', $flowRequest->getFileName())
                );
            }
        }

        $file->saveChunk();
        if ($file->validateFile()) {
            try {
                $file->save($targetPath);
                if($this->fileUploadService->isZipFile($flowRequest->getFileName())) {
                    $tempPrefix = explode('.', $flowRequest->getFileName());
                    $dirTempName = (is_array($tempPrefix)) ? 'unzip_'.$tempPrefix[0] : 'unzip_'.uniqid();
                    $zipDir = $projectCacheDirectory . DIRECTORY_SEPARATOR . $dirTempName;
                    //validate zip file
                    $zip = new \ZipArchive();
                    $res = $zip->open($targetPath);
                    if ($res === TRUE) {
                        $this->zipFilesCount = $zip->numFiles;
                        if ($project->isFrameNumber($this->zipFilesCount)) {
                            throw new ConflictHttpException(
                                sprintf('Project "start frame number" is incorrect  for the file: %s', $flowRequest->getFileName())
                            );
                        }
                        if ($zip->extractTo($zipDir)) {
                            $zip->close();
                            //validate image
                            $this->fileUploadService->validatePngDepth($zipDir, $targetPath, true, $project);
                        } else {
                            throw new ConflictHttpException(
                                sprintf('Error while unpacking the archive: %s', $flowRequest->getFileName())
                            );
                        }
                    } else {
                        throw new ConflictHttpException(
                            sprintf('Error while unpacking the archive: %s', $flowRequest->getFileName())
                        );
                    }

                    //upload zip file
                    $this->videoImporter->importZipImage(
                        $organisation,
                        $project,
                        basename($targetPath),
                        $targetPath,
                        $this->zipFilesCount,
                        false
                    );
                    @unlink($targetPath);
                    //delete do not need image
                    $this->fileUploadService->deleteDir($zipDir);
                } else {
                    if ($this->fileUploadService->isVideoFile($flowRequest->getFileName())) {
                        // for now, we always use compressed images
                        $this->videoImporter->importVideo(
                            $organisation,
                            $project,
                            basename($targetPath),
                            $targetPath,
                            $lossless
                        );
                    } elseif ($this->fileUploadService->isImageFile($flowRequest->getFileName())) {
                        // Image compression is determined by their input image type
                        // PNG -> lossless, jpeg -> compressed.
                        $this->videoImporter->importImage(
                            $organisation,
                            $project,
                            basename($targetPath),
                            $targetPath
                        );
                    } elseif ($this->fileUploadService->isAdditionalFrameNumberMappingFile($flowRequest->getFileName())) {
                        $this->videoImporter->importAdditionalFrameNumberMapping(
                            $organisation,
                            $project,
                            $targetPath
                        );
                    } elseif ($this->fileUploadService->isCalibrationFile($flowRequest->getFileName())) {
                        $this->videoImporter->importCalibrationData($organisation, $project, $targetPath);
                    } else {
                        throw new BadRequestHttpException(
                            sprintf('Invalid file: %s', $flowRequest->getFileName())
                        );
                    }
                }
            } catch (\InvalidArgumentException $exception) {
                throw new ConflictHttpException($exception->getMessage(), $exception);
            } finally {
                // we ignore errors here since this directory will be cleaned up periodically anyway
                @unlink($targetPath);
            }
        }
    }
}