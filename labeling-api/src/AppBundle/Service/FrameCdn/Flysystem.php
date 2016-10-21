<?php

namespace AppBundle\Service\FrameCdn;

use AppBundle\Service;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
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
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameIndex
     * @param string         $imageData
     *
     * @return void
     * @throws \Exception
     */
    public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, int $frameIndex, string $imageData)
    {
        $cdnPath  = sprintf('%s/%s', $video->getId(), $imageType->getName());
        $filePath = sprintf('%s/%s.%s', $cdnPath, $frameIndex, $imageType->getExtension());

        if (!$this->fileSystem->has($cdnPath)) {
            $this->fileSystem->createDir($cdnPath);
        }
        $this->fileSystem->put($filePath, $imageData);
    }

    /**
     * @param Model\LabelingTask          $labelingTask
     * @param ImageType\Base              $imageType
     * @param Model\FrameIndexRange|array $frameNumbers
     *
     * @return array
     */
    public function getFrameLocations(
        Model\LabelingTask $labelingTask,
        ImageType\Base $imageType,
        array $frameNumbers
    ) {
        $urls = [];
        foreach ($frameNumbers as $index => $frameNumber) {
            $urls[] = [
                "frameIndex" => $index,
                'url'        => sprintf(
                    '%s/%s/%s/%s.%s',
                    $this->frameCdnBaseUrl,
                    $labelingTask->getVideoId(),
                    $imageType->getName(),
                    $frameNumber,
                    $imageType->getExtension()
                ),
            ];
        }

        return $urls;
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
}
