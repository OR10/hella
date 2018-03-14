<?php

namespace AnnoStationBundle\Service\FrameCdn;

use AnnoStationBundle\Service;
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
     * @var Service\Storage\StorageFactory
     */
    private $storageFactory;

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
    public function __construct($frameCdnBaseUrl, Service\Storage\StorageFactory $storageFactory, League\Flysystem\Filesystem $fileSystem)
    {
        parent::__construct();

        $this->frameCdnBaseUrl = $frameCdnBaseUrl;
        $this->storageFactory = $storageFactory;
        $this->fileSystem      = $fileSystem;
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameIndex
     * @param string         $imageData
     *
     * @return string
     */
    public function save(Model\Video $video, Model\Video\ImageType\Base $imageType, int $frameIndex, string $imageData)
    {
        $cdnPath  = sprintf('%s/%s', $video->getId(), $imageType->getName());
        $filePath = sprintf('%s/%s.%s', $cdnPath, $frameIndex, $imageType->getExtension());

        if (!$this->fileSystem->has($cdnPath)) {
            $this->fileSystem->createDir($cdnPath);
        }
        $this->fileSystem->put($filePath, $imageData);

        return $filePath;
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param int            $frameIndex
     *
     * @return mixed|void
     */
    public function delete(Model\Video $video, Model\Video\ImageType\Base $imageType, int $frameIndex)
    {
        $cdnPath  = sprintf('%s/%s', $video->getId(), $imageType->getName());
        $filePath = sprintf('%s/%s.%s', $cdnPath, $frameIndex, $imageType->getExtension());

        $this->fileSystem->delete($filePath);
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
        $storage = $this->storageFactory->getStorage();
        $frameCdnBaseUrl = $storage->getStorageData()->getBaseUrl();
        foreach ($frameNumbers as $index => $frameNumber) {
            $urls[] = [
                "frameIndex" => $index,
                'url'        => sprintf(
                    '%s/%s/%s/%s.%s',
//                    $this->frameCdnBaseUrl,
                    $frameCdnBaseUrl,
                    $labelingTask->getVideoId(),
                    $imageType->getName(),
                    $frameNumber,
                    $imageType->getExtension()
                ),
            ];
        }

        return $urls;
    }
}
