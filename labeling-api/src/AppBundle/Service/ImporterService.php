<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Database\Facade;
use AppBundle\Service;

class ImporterService
{
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
    private $labelingTask;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video                 $videoFacade
     * @param Facade\LabelingTask          $labelingTask
     * @param Service\Video\MetaDataReader $metaDataReader
     * @param Video\VideoFrameSplitter     $frameCdnSplitter
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTask,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter
    ) {
        $this->videoFacade      = $videoFacade;
        $this->metaDataReader   = $metaDataReader;
        $this->frameCdnSplitter = $frameCdnSplitter;
        $this->labelingTask     = $labelingTask;
    }

    /**
     * @return Model\LabelingTask
     */
    public function import($filename, ImageType\Base $imageType)
    {
        $video = new Model\Video(basename($filename));
        $video->setMetaData($this->metaDataReader->readMetaData($filename));
        $this->videoFacade->save($video, $filename);
        $this->frameCdnSplitter->splitVideoInFrames($video, $filename, $imageType);
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
        $this->labelingTask->save($labelingTask);

        return $labelingTask;
    }
}
