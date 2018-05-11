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
     * @return string[]|null
     */
    public function uploadFile($request, $organisation, $user, $project)
    {
        $projectCacheDirectory = implode(DIRECTORY_SEPARATOR, [$this->cacheDirectory, $user, $project->getId()]);
        $chunkDirectory        = $projectCacheDirectory . DIRECTORY_SEPARATOR . 'chunks';

        $this->ensureDirectoryExists($projectCacheDirectory);
        $this->ensureDirectoryExists($chunkDirectory);

        /** @var UploadedFile $uploadedFileChunk */
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
                    sprintf('Video/Zip already exists in project: %s', $flowRequest->getFileName())
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
            if(!$this->isZipFile($flowRequest->getFileName())) {
                throw new BadRequestHttpException(
                    sprintf('Invalid file: %s', $flowRequest->getFileName())
                );
            }
        }

        $file->saveChunk();
        if ($file->validateFile()) {
            try {
                $file->save($targetPath);
                if($this->isZipFile($flowRequest->getFileName())) {
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
                            $handle = opendir($zipDir);
                            while ($pngFile = readdir($handle)) {
                                if ($pngFile !== '.' && $pngFile !== '..') {
                                    $imagePath = $zipDir . DIRECTORY_SEPARATOR . $pngFile;
                                    $imagick = new \Imagick($imagePath);
                                    //validate in color depth
                                    if ($imagick->getImageDepth() < 16) {
                                        //delete do not need files in zip archive
                                        @unlink($targetPath);
                                        $this->deleteDir($zipDir);
                                        throw new ConflictHttpException(
                                            sprintf('Invalid color depth in the picture: %s', $pngFile)
                                        );
                                    }
                                    //validate image extension
                                    if (pathinfo($imagePath, PATHINFO_EXTENSION) !== 'png') {
                                        @unlink($targetPath);
                                        $this->deleteDir($zipDir);
                                        throw new ConflictHttpException(
                                            sprintf('Invalid image expansion in: %s', $pngFile)
                                        );
                                    }
                                    //check if project already have image
                                    if ($project->hasVideo($pngFile)) {
                                        throw new ConflictHttpException(
                                            sprintf('Zip content exists in project (either as video or image file): %s', $pngFile)
                                        );
                                    }
                                }
                            }
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
                    $this->deleteDir($zipDir);
                } else {
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
    private function isZipFile(string $filename)
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['zip']);
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

    private function deleteDir($dirPath) {
        if (! is_dir($dirPath)) {
            throw new Exception("$dirPath must be a directory");
        }
        if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
            $dirPath .= '/';
        }
        $files = glob($dirPath . '*', GLOB_MARK);
        foreach ($files as $file) {
            if (is_dir($file)) {
                $this->deleteDir($file);
            } else {
                unlink($file);
            }
        }
        rmdir($dirPath);
    }
}