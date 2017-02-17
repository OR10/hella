<?php

namespace AnnoStationBundle\Service\VideoCdn;

use AnnoStationBundle\Service;
use AppBundle\Model;
use League;

class Flysystem extends Service\VideoCdn
{
    /**
     * @var League\Flysystem\Filesystem
     */
    protected $fileSystem;

    /**
     * FrameCdn constructor.
     *
     * @param League\Flysystem\Filesystem $fileSystem
     */
    public function __construct(League\Flysystem\Filesystem $fileSystem)
    {
        $this->fileSystem = $fileSystem;
    }

    /**
     * @param Model\Video $video
     * @param             $source
     *
     * @return mixed
     */
    public function saveVideo(
        Model\Video $video,
        $source
    ) {
        if (is_resource($source)) {
            $this->fileSystem->writeStream($video->getSourceVideoPath(), $source);
        } elseif (is_file($source)) {
            if (($stream = fopen($source, 'r+')) === false) {
                throw new \RuntimeException("File '{$source}' is not readable");
            }
            $this->fileSystem->writeStream($video->getSourceVideoPath(), $stream);
        } elseif (is_string($source)) {
            $this->fileSystem->write($video->getSourceVideoPath(), $source);
        } else {
            throw new \RuntimeException(sprintf('Unsupported source type: %s', gettype($source)));
        }
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed
     */
    public function getVideo(
        Model\Video $video
    ) {
        return $this->fileSystem->read($video->getSourceVideoPath());
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed|void
     */
    public function deleteVideoDirectory(Model\Video $video)
    {
        $cdnPath  = sprintf('%s', $video->getId());

        $this->fileSystem->deleteDir($cdnPath);
    }
}
