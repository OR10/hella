<?php

namespace Service;

use Service;
use Model;
use League;

class Flysystem extends Service\FrameCdn
{
    /**
     * @var string
     */
    protected $frameCdnBaseUrl;

    /**
     * @var League\Flysystem\Filesystem
     */
    protected $fileSystem;

    /**
     * FrameCdn constructor.
     *
     * @param string                      $frameCdnBaseUrl
     * @param League\Flysystem\Filesystem $fileSystem
     */
    public function __construct($frameCdnBaseUrl, League\Flysystem\Filesystem $fileSystem)
    {
        parent::__construct();

        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
        $this->fileSystem      = $fileSystem;
    }

    /**
     * @param string    $videoId
     * @param Model\ImageType $imageType
     * @param int            $frameIndex
     * @param string         $imageData
     *
     * @return string
     */
    public function save(string $videoId, Model\ImageType $imageType, int $frameIndex, string $imageData)
    {
        $cdnPath  = sprintf('%s/%s', $videoId, $imageType->getName());
        $filePath = sprintf('%s/%s.%s', $cdnPath, $frameIndex, $imageType->getExtension());

        if (!$this->fileSystem->has($cdnPath)) {
            $this->fileSystem->createDir($cdnPath);
        }
        $this->fileSystem->put($filePath, $imageData);

        return $filePath;
    }

}
