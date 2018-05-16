<?php

namespace AnnoStationBundle\Service\v1\Project;

use AnnoStationBundle\Model\Organisation;
use AnnoStationBundle\Service\VideoImporter;
use AppBundle\Exception;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Flow\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class UploadProjectFileService
{

    /**
     * @param string $directory
     */
    public function ensureDirectoryExists(string $directory)
    {
        clearstatcache();
        if (!is_dir($directory) && !@mkdir($directory, 0777, true)) {
            if (!is_dir($directory)) {
                throw new \RuntimeException(sprintf('Failed to create directory: %s', $directory));
            }
        }
    }

    /**
     * @param Request $flowRequest
     * @param string  $uploadCacheDirectory
     * @param string  $targetPath
     */
    public function uploadImportZip(Request $flowRequest, string $uploadCacheDirectory, string $targetPath)
    {
        if($this->isZipFile($flowRequest->getFileName())) {
            $tempPrefix = explode('.', $flowRequest->getFileName());
            $dirTempName = (is_array($tempPrefix)) ? 'unzip_'.$tempPrefix[0] : 'unzip_'.uniqid();
            $zipDir = $uploadCacheDirectory . DIRECTORY_SEPARATOR . $dirTempName;
            //validate zip file
            $zip = new \ZipArchive();
            $res = $zip->open($targetPath);
            if ($res === TRUE) {
                $this->zipFilesCount = $zip->numFiles;
                if ($zip->extractTo($zipDir)) {
                    $zip->close();
                    //validate image inside zip
                    $this->validatePngDepth($zipDir, $targetPath);
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
            //delete do not need image
            $this->deleteDir($zipDir);
        }
    }

    /**
     * @param string             $zipDir
     * @param string             $targetPath
     * @param bool               $isNewProject
     * @param Model\Project|null $project
     */
    public function validatePngDepth(string $zipDir, string $targetPath, bool $isNewProject = false, Model\Project $project = null)
    {
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
                if($isNewProject) {
                    if ($project->hasVideo($pngFile)) {
                        throw new ConflictHttpException(
                            sprintf('Zip content exists in project (either as video or image file): %s', $pngFile)
                        );
                    }
                }
            }
        }
    }

    /**
     * @param string $dirPath
     * @throws Exception
     */
    public function deleteDir(string $dirPath) {
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

    /**
     * @param string $filename
     *
     * @return bool
     */
    public function isZipFile(string $filename) : bool
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['zip']);
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    public function isImageFile(string $filename): bool
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['jpg', 'png']);
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    public function isVideoFile(string $filename) : bool
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['avi', 'mpg', 'mpeg', 'mp4']);
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    public function isCalibrationFile(string $filename) : bool
    {
        return in_array(pathinfo($filename, PATHINFO_EXTENSION), ['csv']);
    }

    /**
     * @param string $filename
     *
     * @return bool
     */
    public function isAdditionalFrameNumberMappingFile(string $filename) : bool
    {
        preg_match('/\.(frame-index\.csv)$/', $filename, $matches);

        return !empty($matches);
    }
}
