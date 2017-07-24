<?php

namespace FileSystemBundle\Model;

use AppBundle\Service\UuidGenerator;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * A reference to a file or directory on a share.
 *
 * @package FileSystemBundle\Model
 *
 * @CouchDB\EmbeddedDocument
 */
class ShareFileReference implements FileReference
{
    const UUID_NAMESPACE_SHARE_FILE_REFERENCE = "53b5c7f2-3f4b-4bc2-9277-6c1d9ff3bba0";

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $shareId;

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $path;

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $size;

    /**
     * @var int
     *
     * @CouchDB\Field(type="integer")
     */
    private $version;

    /**
     * ShareFileReference constructor.
     *
     * @param string $shareId
     * @param string $path
     * @param int    $size
     * @param int    $version
     */
    public function __construct(string $shareId, string $path, int $size = 0, int $version = 1)
    {
        $this->shareId = $shareId;
        $this->path    = trim(preg_replace('/\/+/', '/', $path), '/');
        $this->size    = $size;
        $this->version = $version;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @return string
     */
    public function getShareId()
    {
        return $this->shareId;
    }

    /**
     * @return string
     */
    public function getBasename()
    {
        return basename($this->getPath());
    }

    /**
     * @return int
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @return string
     */
    public function getId()
    {
        $uuidGenerator = new UuidGenerator();

        return $uuidGenerator->generateUuidV5(
            self::UUID_NAMESPACE_SHARE_FILE_REFERENCE,
            $this->getShareId(),
            $this->getPath(),
            $this->getVersion()
        );
    }

    /**
     * @return int
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return sprintf(
            "ShareFileReference(shareId = '%s', path = '%s', id = '%s', version = '%s')",
            $this->getShareId(),
            $this->getPath(),
            $this->getId(),
            $this->getVersion()
        );
    }
}
