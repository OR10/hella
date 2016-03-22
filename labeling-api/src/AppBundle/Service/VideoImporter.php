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
     * @var WorkerPool\Facade
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
     * @param string $name The name for the video (usually the basename).
     * @param string $path The filesystem path to the video file.
     * @param bool $lossless Wether or not the UI should use lossless compressed images.
     * @param int $splitLength Create tasks for each $splitLength time of the video (in seconds, 0 = no split).
     * @param             $isObjectLabeling
     * @param             $isMetaLabeling
     * @param $labelInstructions
     * @param int|null $minimalVisibleShapeOverflow
     * @param string|null $drawingTool
     * @param array $drawingToolOptions
     * @return Model\LabelingTask[]
     * @throws Video\Exception\MetaDataReader
     * @throws \Exception
     */
    public function import(
        $name,
        $path,
        $lossless = false,
        $splitLength = 0,
        $isObjectLabeling,
        $isMetaLabeling,
        $labelInstructions,
        $minimalVisibleShapeOverflow = null,
        $drawingTool = null,
        $drawingToolOptions = array()
    ) {
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

        $framesPerChunk = $video->getMetaData()->numberOfFrames;
        if ($splitLength > 0) {
            $framesPerChunk = min($framesPerChunk, round($splitLength * $video->getMetaData()->fps));
        }

        $tasks = [];

        for (
            $startFrameNumber = 1;
            $startFrameNumber <= $video->getMetaData()->numberOfFrames;
            $startFrameNumber += $framesPerChunk
        ) {
            $frameRange = new Model\FrameRange(
                $startFrameNumber,
                min($video->getMetaData()->numberOfFrames, $startFrameNumber + $framesPerChunk - 1)
            );
            if ($isMetaLabeling) {
                $tasks[] = $this->addTask(
                    $video,
                    $frameRange,
                    Model\LabelingTask::TYPE_META_LABELING,
                    null,
                    [],
                    $imageTypes,
                    null,
                    null,
                    $drawingToolOptions
                );
            }

            if ($isObjectLabeling) {
                foreach ($labelInstructions as $labelInstruction) {
                    $tasks[] = $this->addTask(
                        $video,
                        $frameRange,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $drawingTool,
                        ['pedestrian'],
                        $imageTypes,
                        $labelInstruction,
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions
                    );
                }
            }
        }

        return $tasks;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video $video
     * @param Model\FrameRange $frameRange
     * @param string $taskType
     * @param string|null $drawingTool
     * @param string[] $predefinedClasses
     * @param                  $imageTypes
     * @param                  $instruction
     * @param int|null $minimalVisibleShapeOverflow
     * @param $drawingToolOptions
     *
     * @return Model\LabelingTask
     */
    private function addTask(
        Model\Video $video,
        Model\FrameRange $frameRange,
        $taskType,
        $drawingTool,
        $predefinedClasses,
        $imageTypes,
        $instruction,
        $minimalVisibleShapeOverflow,
        $drawingToolOptions
    ) {
        $metadata     = $video->getMetaData();
        $labelingTask = new Model\LabelingTask(
            $video,
            clone $frameRange,
            $taskType,
            $drawingTool,
            $predefinedClasses,
            $imageTypes
        );

        $labelingTask->setDescriptionTitle('Identify the person');
        $labelingTask->setDescriptionText(
            'How is the view on the person? ' .
            'Which side does one see from the person and from which side is the person entering the screen?'
        );

        $labelingTask->setLabelStructure($this->getLabelStructureForTypeAndInstruction($taskType, $instruction));
        $labelingTask->setLabelStructureUi($this->getLabelStructureUiForTypeAndInstruction($taskType, $instruction));
        $labelingTask->setLabelInstruction($instruction);

        $labelingTask->setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow);
        $labelingTask->setDrawingToolOptions($drawingToolOptions);

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

    private function getLabelStructureForTypeAndInstruction($type, $instruction)
    {
        if ($type === Model\LabelingTask::TYPE_META_LABELING) {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s.json',
                    __DIR__,
                    $type
                )
            );
        } else {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s-%s.json',
                    __DIR__,
                    $type,
                    $instruction
                )
            );
        }

        return json_decode($structure, true);
    }

    private function getLabelStructureUiForTypeAndInstruction($type, $instruction)
    {
        if ($type === Model\LabelingTask::TYPE_META_LABELING) {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s-ui.json',
                    __DIR__,
                    $type
                )
            );
        } else {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s-%s-ui.json',
                    __DIR__,
                    $type,
                    $instruction
                )
            );
        }

        return json_decode($structure, true);
    }
}
