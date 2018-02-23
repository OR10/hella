<?php

namespace AnnoStationBundle\Service\Storage;

use AnnoStationBundle\Service\S3Cmd;

class StorageFactory
{
    const AZURE = 'Azure';
    const S3CMD = 'S3Cmd';

    public function getStorage($storage) {
        return new $storage;
    }
}