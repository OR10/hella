<?php

namespace AnnoStationBundle\Service;

interface StorageInterface
{
    /**
     * @param $sourceDirectory
     * @param $targetDirectory
     * @param $acl
     * @return mixed
     */
    public function uploadDirectory($sourceDirectory, $targetDirectory, $acl);

    /**
     * @param $sourceFile
     * @param $targetFileOnS3
     * @param $acl
     * @return mixed
     */
    public function uploadFile($sourceFile, $targetFileOnS3, $acl);

    /**
     * @param $filePath
     * @return mixed
     */
    public function getFile($filePath);
}