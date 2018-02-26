<?php

namespace AnnoStationBundle\Service\Project;

use AnnoStationBundle\Service\VideoImporter;
use Flow\Config;
use Flow\File;
use Flow\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

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
     * BatchUploadService constructor.
     *
     * @param string         $cacheDirectory
     * @param VideoImporter  $videoImporter
     */
    public function __construct(
        string $cacheDirectory,
        VideoImporter $videoImporter
    )
    {
        $this->cacheDirectory  = $cacheDirectory;
        $this->videoImporter   = $videoImporter;
    }


    /**
     * uploading file
     * @param $organisation
     * @param $user
     * @param $request
     * @return static
     */
    public function uploadFile($request, $organisation, $user, $project)
    {
        $projectCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $project->getId()]);
        $chunkDirectory        = $projectCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->ensureDirectoryExists($projectCacheDirectory);
        $this->ensureDirectoryExists($chunkDirectory);

        //upload video
        $uploadedFileChunk = $request->files->get('file');
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

        if ($this->isVideoFile($flowRequest->getFileName())) {
            if ($project->hasVideo($flowRequest->getFileName())) {

                throw new ConflictHttpException(
                    sprintf('Video already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->isAdditionalFrameNumberMappingFile($flowRequest->getFileName())) {
            if ($project->hasAdditionalFrameNumberMapping($flowRequest->getFileName())) {
                throw new ConflictHttpException(
                    sprintf('FrameMapping data already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->isCalibrationFile($flowRequest->getFileName())) {
            if ($project->hasCalibrationData($flowRequest->getFileName())) {
                throw new ConflictHttpException(
                    sprintf('Calibration data already exists in project: %s', $flowRequest->getFileName())
                );
            }
        } elseif ($this->isImageFile($flowRequest->getFileName())) {
            if ($project->hasVideo($flowRequest->getFileName())) {
                throw new ConflictHttpException(
                    sprintf('Image already exists in project (either as video or image file): %s', $flowRequest->getFileName())
                );
            }
        } else {
            throw new BadRequestHttpException(
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
                    throw new BadRequestHttpException(
                        sprintf('Invalid file: %s', $flowRequest->getFileName())
                    );
                }
            } catch (\InvalidArgumentException $exception) {
                throw new ConflictHttpException($exception->getMessage(), $exception);
            } finally {
                // we ignore errors here since this directory will be cleaned up periodically anyway
                @unlink($targetPath);
            }
        }
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
     * @param string $filename
     *
     * @return bool
     */
    private function isImageFile(string $filename): bool
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['jpg', 'png']);
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
}
