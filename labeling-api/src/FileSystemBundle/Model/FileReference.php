<?php

namespace FileSystemBundle\Model;

/**
 * An interface describing a reference to a file or directory.
 *
 * @package FileSystemBundle\Model
 */
interface FileReference
{

    /**
     * Returns the path to the represented file.
     *
     * @return string
     */
    public function getPath();

    /**
     * Returns the basename of the represented file.
     *
     * @return string
     */
    public function getBasename();

    /**
     * Returns the filesize of the represented file.
     *
     * @return int
     */
    public function getSize();

    /**
     * Returns a named unique id for the given file and path.
     *
     * @return string
     */
    public function getId();

    /*
     * Returns the version of the given file.
     *
     * @return int
     */
    public function getVersion();
}
