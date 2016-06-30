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
     * @var Facade\Project
     */
    private $projectFacade;

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
     * @var Service\LabelStructure
     */
    private $labelStructureService;

    /**
     * @var WorkerPool\Facade
     */
    private $facadeAMQP;
    
    /**
     * @var CalibrationFileConverter
     */
    private $calibrationFileConverter;

    /**
     * @param Facade\Project $projectFacade
     * @param Facade\Video $videoFacade
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     * @param Video\VideoFrameSplitter $frameCdnSplitter
     * @param Service\LabelStructure $labelStructureService
     * @param WorkerPool\Facade $facadeAMQP
     *
     * @param CalibrationFileConverter $calibrationFileConverter
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter,
        Service\LabelStructure $labelStructureService,
        WorkerPool\Facade $facadeAMQP,
        Service\CalibrationFileConverter $calibrationFileConverter
    ) {
        $this->projectFacade         = $projectFacade;
        $this->videoFacade           = $videoFacade;
        $this->metaDataReader        = $metaDataReader;
        $this->frameCdnSplitter      = $frameCdnSplitter;
        $this->labelingTaskFacade    = $labelingTaskFacade;
        $this->labelStructureService = $labelStructureService;
        $this->facadeAMQP            = $facadeAMQP;
        $this->calibrationFileConverter = $calibrationFileConverter;
    }

    /**
     * @param string $name The name for the video (usually the basename).
     * @param string $projectName
     * @param string $path The filesystem path to the video file.
     * @param $calibrationFile
     * @param bool $lossless Wether or not the UI should use lossless compressed images.
     * @param int $splitLength Create tasks for each $splitLength time of the video (in seconds, 0 = no split).
     * @param bool $isObjectLabeling
     * @param bool $isMetaLabeling
     * @param array $labelInstructions
     * @param int|null $minimalVisibleShapeOverflow
     * @param array $drawingToolOptions
     * @param int $frameSkip
     * @param int $startFrame
     *
     * @return Model\LabelingTask[]
     * @throws Video\Exception\MetaDataReader
     * @throws \Exception
     */
    public function import(
        $name,
        $projectName,
        $path,
        $calibrationFile,
        $lossless = false,
        $splitLength = 0,
        $isObjectLabeling,
        $isMetaLabeling,
        $labelInstructions,
        $minimalVisibleShapeOverflow = null,
        $drawingToolOptions = array(),
        $frameSkip = 1,
        $startFrame = 1
    ) {
        $video = new Model\Video($name);
        $video->setMetaData($this->metaDataReader->readMetaData($path));
        if ($calibrationFile !== null) {
            $this->calibrationFileConverter->setCalibrationData($calibrationFile);
            $video->setRawCalibration($this->calibrationFileConverter->getRawData());
            $video->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
            $video->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
            $video->setTranslation($this->calibrationFileConverter->getTranslation());
            $video->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());
        }
        $this->videoFacade->save($video, $path);

        $project = $this->projectFacade->findByName($projectName);
        if ($project === null) {
            $project = new Model\Project($projectName);
            $this->projectFacade->save($project);
        }

        $imageTypes = $this->getImageTypes($lossless);

        foreach ($imageTypes as $imageTypeName) {
            $video->setImageType($imageTypeName, 'converted', false);
            $this->videoFacade->update();
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $video->getSourceVideoPath(),
                ImageType\Base::create($imageTypeName)

            );

            $amqpFacade = $this->facadeAMQP;
            $amqpFacade->addJob($job, $amqpFacade::LOW_PRIO);
        }

        $framesPerVideoChunk = $video->getMetaData()->numberOfFrames;
        if ($splitLength > 0) {
            $framesPerVideoChunk = min($framesPerVideoChunk, round($splitLength * $video->getMetaData()->fps));
        }

        $tasks = [];

        $videoFrameMapping = range(
            (int) $startFrame,
            (int) $video->getMetaData()->numberOfFrames,
            $frameSkip
        );

        $frameMappingChunks = [];
        while (count($videoFrameMapping) > 0) {
            $frameMappingChunks[] = array_splice($videoFrameMapping, 0, round($framesPerVideoChunk / $frameSkip));
        }

        foreach ($frameMappingChunks as $frameNumberMapping) {
            $frameRange = new Model\FrameNumberRange(
                1,
                $video->getMetaData()->numberOfFrames
            );
            $metadata   = array(
                'frameRange'       => $frameRange,
                'frameSkip'        => $frameSkip,
                'startFrameNumber' => $startFrame,
            );

            if ($isMetaLabeling) {
                $tasks[] = $this->addTask(
                    $video,
                    $project,
                    $frameNumberMapping,
                    Model\LabelingTask::TYPE_META_LABELING,
                    null,
                    [],
                    $imageTypes,
                    null,
                    null,
                    $drawingToolOptions,
                    $metadata
                );
            }

            if ($isObjectLabeling) {
                foreach ($labelInstructions as $labelInstruction) {
                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $labelInstruction['drawingTool'],
                        ['pedestrian'],
                        $imageTypes,
                        $labelInstruction['instruction'],
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        $metadata
                    );
                }
            }
        }

        return $tasks;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video      $video
     * @param Model\Project    $project
     * @param                  $frameNumberMapping
     * @param string           $taskType
     * @param string|null      $drawingTool
     * @param string[]         $predefinedClasses
     * @param                  $imageTypes
     * @param                  $instruction
     * @param int|null         $minimalVisibleShapeOverflow
     * @param                  $drawingToolOptions
     * @param                  $metadata
     *
     * @return Model\LabelingTask
     */
    private function addTask(
        Model\Video $video,
        Model\Project $project,
        $frameNumberMapping,
        $taskType,
        $drawingTool,
        $predefinedClasses,
        $imageTypes,
        $instruction,
        $minimalVisibleShapeOverflow,
        $drawingToolOptions,
        $metadata
    ) {
        $labelingTask = new Model\LabelingTask(
            $video,
            $project,
            $frameNumberMapping,
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

        $labelingTask->setLabelStructure(
            $this->labelStructureService->getLabelStructureForTypeAndInstruction($taskType, $instruction)
        );
        $labelingTask->setLabelStructureUi(
            $this->labelStructureService->getLabelStructureUiForTypeAndInstruction($taskType, $instruction)
        );
        $labelingTask->setLabelInstruction($instruction);

        $labelingTask->setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow);
        $labelingTask->setDrawingToolOptions($drawingToolOptions);
        $labelingTask->setMetaData($metadata);

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
