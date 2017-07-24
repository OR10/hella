<?php

namespace FileSystemBundle\Model;

/**
 * Model representing a mounted share
 *
 * @package FileSystemBundle\Model
 */
class Share
{
    /**
     * @var string
     */
    private $shareId;

    /**
     * @var string
     */
    private $rootDirectory;

    /**
     * @var string
     */
    private $userRootDirectory;

    /**
     * @var bool
     */
    private $readOnly;

    /**
     * Share constructor.
     *
     * @param string $shareId
     * @param array  $declaration
     */
    public function __construct(string $shareId, array $declaration)
    {
        $this->shareId           = $shareId;
        $this->rootDirectory     = $declaration['rootDirectory'];
        $this->userRootDirectory = $declaration['userRootDirectory'];
        $this->readOnly          = filter_var($declaration['readOnly'] ?? "", FILTER_VALIDATE_BOOLEAN);
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
    public function getRootDirectory()
    {
        return $this->rootDirectory;
    }

    /**
     * @return string
     */
    public function getUserRootDirectory()
    {
        return $this->userRootDirectory;
    }

    /**
     * @param string $path
     *
     * @return string
     */
    public function getUserPathFor(string $path)
    {
        return $this->userRootDirectory . '\\' . str_replace("/", "\\", $path);
    }

    /**
     * @return bool
     */
    public function isReadOnly(): bool
    {
        return $this->readOnly;
    }
}
