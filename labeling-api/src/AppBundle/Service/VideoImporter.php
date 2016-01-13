<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool;

class VideoImporter
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
    private $labelingTaskFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $facadeAMQP;

    /**
     * @param Facade\Video                 $videoFacade
     * @param Facade\LabelingTask          $labelingTaskFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     * @param Video\VideoFrameSplitter     $frameCdnSplitter
     * @param WorkerPool\Facade            $facadeAMQP
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter,
        WorkerPool\Facade $facadeAMQP
    ) {
        $this->videoFacade        = $videoFacade;
        $this->metaDataReader     = $metaDataReader;
        $this->frameCdnSplitter   = $frameCdnSplitter;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->facadeAMQP         = $facadeAMQP;
    }

    /**
     * @param string $name     The name for the video (usually the basename).
     * @param string $path     The filesystem path to the video file.
     * @param bool   $lossless Wether or not the UI should use lossless compressed images.
     *
     * @return Model\LabelingTask[]
     *
     * @throws Video\Exception\MetaDataReader
     * @throws \Exception
     */
    public function import($name, $path, $lossless = false)
    {
        $video = new Model\Video($name);
        $video->setMetaData($this->metaDataReader->readMetaData($path));
        $this->videoFacade->save($video, $path);

        $imageTypes = $this->getImageTypes($lossless);

        foreach ($imageTypes as $imageTypeName) {
            $video->setImageType($imageTypeName, 'converted', false);
            $this->videoFacade->update();
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $video->getSourceVideoPath(),
                ImageType\Base::create($imageTypeName)
            );

            $this->facadeAMQP->addJob($job);
        }

        $tasks = [];

        $tasks[] = $this->addTask($video, Model\LabelingTask::TYPE_META_LABELING, null, [], $imageTypes);
        $tasks[] = $this->addTask(
            $video,
            Model\LabelingTask::TYPE_OBJECT_LABELING,
            Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
            ['pedestrian'],
            $imageTypes
        );

        return $tasks;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video $video
     * @param string      $taskType
     * @param string|null $drawingTool
     * @param string[]    $predefinedClasses
     * @param             $imageTypes
     *
     * @return Model\LabelingTask
     */
    private function addTask(Model\Video $video, $taskType, $drawingTool, $predefinedClasses, $imageTypes)
    {
        $metadata     = $video->getMetaData();
        $frameRange   = new Model\FrameRange(1, $metadata->numberOfFrames);
        $labelingTask = new Model\LabelingTask(
            $video,
            $frameRange,
            $taskType,
            $drawingTool,
            $predefinedClasses,
            $imageTypes
        );
        $labelingTask->setDescriptionTitle('Identify the person');
        $labelingTask->setDescriptionText(
            'How is the view on the person? Which side does one see from the person and from which side is the person entering the screen?'
        );
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }

    /**
     * Get the list of image types that should be generated for the task.
     *
     * TODO: Currently, we don't know how the image types are actually
     *       determined, so the list is hardcoded and depends only on wether or
     *       not we are allowed to use lossy compressed images or not but this
     *       will change in the future.
     *
     * @param bool $lossless
     *
     * @return array List of image types to generate for the task.
     */
    private function getImageTypes($lossless)
    {
        if ($lossless) {
            return ['source', 'thumbnail'];
        }

        return ['sourceJpg', 'thumbnail'];
    }
}
