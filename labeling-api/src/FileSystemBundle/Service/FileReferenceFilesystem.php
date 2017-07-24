<?php

namespace FileSystemBundle\Service;

use Doctrine\Common\Proxy\Exception\InvalidArgumentException;
use FileSystemBundle\Model\FileReference;
use FileSystemBundle\Model\ShareFileReference;
use League\Flysystem\Adapter\Local;
use League\Flysystem\Filesystem;

/**
 * An abstract implementation of a filesystem based on FileReferences.
 *
 * @package FileSystemBundle\Service
 */
class FileReferenceFilesystem
{
    /**
     * @var Filesystem
     */
    private $filesystem;

    /**
     * FileLocationFilesystem constructor.
     *
     * @param FileSystem    $filesystem
     * @param ShareRegistry $shareRegistry
     */
    public function __construct(Filesystem $filesystem, ShareRegistry $shareRegistry)
    {
        $this->filesystem    = $filesystem;
        $this->shareRegistry = $shareRegistry;
    }

    /**
     * Lists all files and directories within the given $fileReference.
     *
     * @param FileReference $fileReference
     * @param bool          $recursive
     * @param string[]      $filter
     *
     * @return FileReference[]
     */
    public function listFiles(FileReference $fileReference, bool $recursive = true, array $filter = [])
    {
        $flysystemPath = $this->getFilesystemPath($fileReference);
        $result        = array();

        foreach ($this->filesystem->listFiles($flysystemPath, $recursive) as $file) {
            foreach ($filter as $pattern) {
                if (preg_match($pattern, $file['path'])) {
                    continue 2;
                }
            }

            $result[] = $this->convertToFileReference($fileReference, $file);
        }

        return $result;
    }

    /**
     * @param FileReference $fileReference
     * @param bool          $recursive
     *
     * @return FileReference[]
     */
    public function listDirectories(FileReference $fileReference, $recursive = true)
    {
        $flysystemPath = $this->getFilesystemPath($fileReference);
        $result        = array();

        foreach ($this->filesystem->listContents($flysystemPath, $recursive) as $file) {
            if ($file['type'] == 'file') {
                continue;
            }

            $result[] = $this->convertToFileReference($fileReference, $file);
        }

        return $result;
    }

    /**
     * @param FileReference $fileReference
     *
     * @return string
     */
    public function getFileContent(FileReference $fileReference): string
    {
        $absolutePath = $this->getFilesystemPath($fileReference);

        return $this->filesystem->read($absolutePath);
    }

    /**
     * @param FileReference $fromFile
     * @param FileReference $toFile
     *
     * @return bool
     */
    public function move(FileReference $fromFile, FileReference $toFile)
    {
        if ($this->filesystem->getAdapter() instanceof Local) {
            return $this->filesystem->rename($this->getFilesystemPath($fromFile), $this->getFilesystemPath($toFile));
        }

        // The 'rename' method does not officially support moving directories but is limited to moving files.
        // However, some adapter also allows moving directories, the Local adapter which we use being one of them.
        // Hence we decided to go this way. In case we switch to other adapters, we need to be aware that this
        // method might react differently.
        // i.e.: https://github.com/thephpleague/flysystem/issues/604
        throw new InvalidArgumentException('unsupported adapter: ' . get_class($this->filesystem->getAdapter()));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return bool
     */
    public function exists(FileReference $fileReference)
    {
        return $this->filesystem->has($this->getFilesystemPath($fileReference));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return bool
     */
    public function delete(FileReference $fileReference)
    {
        return $this->filesystem->delete($this->getFilesystemPath($fileReference));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return bool
     */
    public function deleteDirectory(FileReference $fileReference)
    {
        return $this->filesystem->deleteDir($this->getFilesystemPath($fileReference));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return bool
     */
    public function createDirectory(FileReference $fileReference)
    {
        return $this->filesystem->createDir($this->getFilesystemPath($fileReference));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return string
     */
    public function getUserFilePath(FileReference $fileReference): string
    {
        if ($fileReference instanceof ShareFileReference) {
            return $this->getSharePath($fileReference);
        }

        $this->unsupportedFileReference($fileReference);
    }

    /**
     * @param FileReference $fileReference
     *
     * @return string
     */
    public function getMimetype(FileReference $fileReference)
    {
        return $this->filesystem->getMimetype($this->getFilesystemPath($fileReference));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return string
     */
    public function getFilesystemPath(FileReference $fileReference)
    {
        if ($fileReference instanceof ShareFileReference) {
            $shareRootPath = $this->getShareRootPath($fileReference->getShareId());

            return $shareRootPath . '/' . $fileReference->getPath();
        }

        $this->unsupportedFileReference($fileReference);
    }

    /**
     * @param FileReference $fileReference
     *
     * @return bool
     */
    public function isReadOnly(FileReference $fileReference)
    {
        if ($fileReference instanceof ShareFileReference) {
            return $this->shareRegistry->getShare($fileReference->getShareId())->isReadOnly();
        }

        $this->unsupportedFileReference($fileReference);
    }

    /**
     * @param FileReference $rootReference
     * @param array         $file
     *
     * @return ShareFileReference
     */
    private function convertToFileReference(FileReference $rootReference, array $file)
    {
        if ($rootReference instanceof ShareFileReference) {
            $rootShare = $this->shareRegistry->getShare($rootReference->getShareId());

            return new ShareFileReference(
                $rootReference->getShareId(),
                substr($file['path'], strlen(ltrim($rootShare->getRootDirectory(), "/")) + 1),
                $file['size'] ?? 0
            );
        }
        $this->unsupportedFileReference($rootReference);
    }

    /**
     * @param string $shareId
     *
     * @return string
     */
    private function getShareRootPath(string $shareId)
    {
        return $this->shareRegistry->getShare($shareId)->getRootDirectory();
    }

    /**
     * @param ShareFileReference $fileReference
     *
     * @return string
     */
    private function getSharePath(ShareFileReference $fileReference)
    {
        return $this->shareRegistry->getShare($fileReference->getShareId())->getUserPathFor($fileReference->getPath());
    }

    /**
     * @param FileReference $fileReference
     */
    private function unsupportedFileReference(FileReference $fileReference)
    {
        throw new InvalidArgumentException('unsupported FileReference: ' . get_class($fileReference));
    }

    /**
     * @param FileReference $fileReference
     *
     * @return string[]|null
     */
    public function stat(FileReference $fileReference)
    {
        return $this->filesystem->getMetadata($this->getFilesystemPath($fileReference));
    }

    /**
     * @param FileReference $fromFileReference
     * @param FileReference $toFileReference
     *
     * @return bool
     */
    public function copy(FileReference $fromFileReference, FileReference $toFileReference)
    {
        return $this->filesystem->copy(
            $this->getFilesystemPath($fromFileReference),
            $this->getFilesystemPath($toFileReference)
        );
    }

    /**
     * @param FileReference $fileReference
     * @param resource      $stream
     */
    public function writeStream(FileReference $fileReference, $stream)
    {
        $this->filesystem->writeStream($this->getFilesystemPath($fileReference), $stream);
    }
}
