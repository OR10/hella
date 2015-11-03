<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Database\Facade;
use AppBundle\Service;

class ImporterService
{
    /**
     * List of image types to create after importing a video.
     *
     * @todo This list currently contains all image types since the labeling
     *       task is currently created by this service for the whole video.
     *       This may change in future versions where some or all image types
     *       are defined by the labeling task. However, when this happens, this
     *       service has to be refactored anyway.
     */
    CONST IMAGE_TYPES = [
        'source',
    ];

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;

    /**
     * @var Service\Video\VideoFrameSplitter
     */
    private $frameCdnSplitter;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video                 $videoFacade
     * @param Facade\LabelingTask          $labelingTaskFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     * @param Video\VideoFrameSplitter     $frameCdnSplitter
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter
    ) {
        $this->videoFacade        = $videoFacade;
        $this->metaDataReader     = $metaDataReader;
        $this->frameCdnSplitter   = $frameCdnSplitter;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @param string $filename
     * @param        $stream
     *
     * @return Model\LabelingTask
     *
     * @throws Video\Exception\MetaDataReader
     * @throws \Exception
     */
    public function import($filename, $stream)
    {
        $video = new Model\Video(basename($filename));
        $video->setMetaData($this->metaDataReader->readMetaData($filename));
        $this->videoFacade->save($video, $stream);

        foreach (self::IMAGE_TYPES as $imageTypeName) {
            $this->frameCdnSplitter->splitVideoInFrames($video, $filename, ImageType\Base::create($imageTypeName));
        }

        $task = $this->addTask($video);

        return $task;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video $video
     *
     * @return Model\LabelingTask
     */
    private function addTask(Model\Video $video)
    {
        $metadata     = $video->getMetaData();
        $frameRange   = new Model\FrameRange(1, $metadata->numberOfFrames);
        $labelingTask = new Model\LabelingTask($video, $frameRange);
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }
}
