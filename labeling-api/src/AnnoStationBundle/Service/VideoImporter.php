<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use crosscan\WorkerPool;
use Doctrine\ODM\CouchDB;

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
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

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
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @param Facade\Project                   $projectFacade
     * @param Facade\Video                     $videoFacade
     * @param Facade\CalibrationData           $calibrationDataFacade
     * @param Facade\LabelingTask              $labelingTaskFacade
     * @param Video\MetaDataReader             $metaDataReader
     * @param Service\Video\VideoFrameSplitter $frameCdnSplitter
     * @param LabelStructure                   $labelStructureService
     * @param WorkerPool\Facade                $facadeAMQP
     * @param CalibrationFileConverter         $calibrationFileConverter
     * @param Facade\TaskConfiguration         $taskConfigurationFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter,
        Service\LabelStructure $labelStructureService,
        WorkerPool\Facade $facadeAMQP,
        Service\CalibrationFileConverter $calibrationFileConverter,
        Facade\TaskConfiguration $taskConfigurationFacade
    ) {
        $this->projectFacade            = $projectFacade;
        $this->videoFacade              = $videoFacade;
        $this->calibrationDataFacade    = $calibrationDataFacade;
        $this->metaDataReader           = $metaDataReader;
        $this->frameCdnSplitter         = $frameCdnSplitter;
        $this->labelingTaskFacade       = $labelingTaskFacade;
        $this->labelStructureService    = $labelStructureService;
        $this->facadeAMQP               = $facadeAMQP;
        $this->calibrationFileConverter = $calibrationFileConverter;
        $this->taskConfigurationFacade  = $taskConfigurationFacade;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $videoName
     * @param string                              $videoFilePath
     * @param bool                                $lossless
     *
     * @return Model\Video
     * @throws CouchDB\UpdateConflictException
     */
    public function importVideo(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $videoName,
        string $videoFilePath,
        bool $lossless
    ) {
        $imageTypes = $this->getImageTypes($lossless);
        $video      = new Model\Video($organisation, $videoName);

        $video->setMetaData($this->metaDataReader->readMetaData($videoFilePath));
        $this->videoFacade->save($video, $videoFilePath);

        $conflictException = null;
        for ($retries = 0; $retries < 5; ++$retries) {
            $conflictException = null;
            try {
                $project->addVideo($video);
                $videoSize = $video->getMetaData()->sizeInBytes;
                $project->setDiskUsageInBytes($project->getDiskUsageInBytes() + $videoSize);
                $this->projectFacade->save($project);
                break;
            } catch (CouchDB\UpdateConflictException $exception) {
                $conflictException = $exception;
                $this->projectFacade->reload($project);
            }
        }

        if ($conflictException !== null) {
            throw $conflictException;
        }

        foreach ($imageTypes as $imageTypeName) {
            $video->setImageType($imageTypeName, 'converted', false);
            $this->videoFacade->update();
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $video->getSourceVideoPath(),
                ImageType\Base::create($imageTypeName)
            );

            $this->facadeAMQP->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return $video;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $imageName
     * @param string                              $imageFilePath
     *
     * @return Model\Video
     * @throws CouchDB\UpdateConflictException
     */
    public function importImage(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $imageName,
        string $imageFilePath
    ) {
        // Compression state is determined by the given image type for now
        $imageFileExtension = pathinfo($imageFilePath, PATHINFO_EXTENSION);
        $lossless           = \strcasecmp($imageFileExtension, 'png') === 0;

        // Images may be mostly treated like videos, als ffmpeg can handle image input as well :)
        return $this->importVideo(
            $organisation,
            $project,
            $imageName,
            $imageFilePath,
            $lossless
        );
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $calibrationFilePath
     *
     * @return Model\CalibrationData
     * @throws CouchDB\UpdateConflictException
     */
    public function importCalibrationData(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $calibrationFilePath
    ) {
        $calibrationName = basename($calibrationFilePath);

        $this->calibrationFileConverter->setCalibrationData($calibrationFilePath);

        $calibration = new Model\CalibrationData($organisation, $calibrationName);

        $calibration->setRawCalibration($this->calibrationFileConverter->getRawData());
        $calibration->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
        $calibration->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
        $calibration->setTranslation($this->calibrationFileConverter->getTranslation());
        $calibration->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());

        $this->calibrationDataFacade->save($calibration);

        $conflictException = null;
        for ($retries = 0; $retries < 5; ++$retries) {
            $conflictException = null;
            try {
                $project->addCalibrationData($calibration);
                $this->projectFacade->save($project);
                break;
            } catch (CouchDB\UpdateConflictException $exception) {
                $conflictException = $exception;
                $this->projectFacade->reload($project);
            }
        }

        if ($conflictException !== null) {
            throw $conflictException;
        }

        return $calibration;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param string                              $name        The name for the video (usually the basename).
     * @param string                              $projectName
     * @param string                              $path        The filesystem path to the video file.
     * @param string                              $calibrationFile
     * @param bool                                $isObjectLabeling
     * @param bool                                $isMetaLabeling
     * @param array                               $labelInstructions
     * @param bool                                $lossless    Wether or not the UI should use lossless compressed
     *                                                         images.
     * @param int                                 $splitLength Create tasks for each $splitLength time of the video (in
     *                                                         seconds, 0 = no split).
     * @param int|null                            $minimalVisibleShapeOverflow
     * @param array                               $drawingToolOptions
     * @param int                                 $frameSkip
     * @param int                                 $startFrame
     * @param bool                                $review
     * @param bool                                $revision
     * @param Model\User                          $user
     * @param bool                                $legacyExport
     *
     * @return Model\LabelingTask[]
     * @throws \Exception
     */
    public function import(
        AnnoStationBundleModel\Organisation $organisation,
        $name,
        $projectName,
        $path,
        $calibrationFile,
        $isObjectLabeling,
        $isMetaLabeling,
        $labelInstructions,
        $lossless = false,
        $splitLength = 0,
        $minimalVisibleShapeOverflow = null,
        $drawingToolOptions = array(),
        $frameSkip = 1,
        $startFrame = 1,
        $review = false,
        $revision = false,
        Model\User $user = null,
        $legacyExport = false
    ) {
        $video = new Model\Video($organisation, $name);
        $video->setMetaData($this->metaDataReader->readMetaData($path));
        if ($calibrationFile !== null) {
            $this->calibrationFileConverter->setCalibrationData($calibrationFile);
            $calibrationData = new Model\CalibrationData($organisation, $name);
            $calibrationData->setRawCalibration($this->calibrationFileConverter->getRawData());
            $calibrationData->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
            $calibrationData->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
            $calibrationData->setTranslation($this->calibrationFileConverter->getTranslation());
            $calibrationData->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());

            $this->calibrationDataFacade->save($calibrationData);
            $video->setCalibrationId($calibrationData->getId());
        }
        $this->videoFacade->save($video, $path);

        $project = $this->projectFacade->findByName($projectName);
        if ($project === null) {
            $labelingValidationProcesses = [];
            if ($review) {
                $labelingValidationProcesses[] = 'review';
            }
            if ($revision) {
                $labelingValidationProcesses[] = 'revision';
            }
            $project = new Model\Project(
                $projectName,
                $organisation,
                null,
                null,
                null,
                $labelingValidationProcesses,
                $frameSkip,
                $startFrame,
                $splitLength
            );
            if ($legacyExport) {
                $project->setAvailableExports(['legacy']);
                foreach ($labelInstructions as $labelInstruction) {
                    $project->addLegacyTaskInstruction(
                        $labelInstruction['instruction'],
                        $labelInstruction['drawingTool']
                    );
                }
            } else {
                $project->setAvailableExports(['genericXml']);
                foreach ($labelInstructions as $labelInstruction) {
                    $project->addGenericXmlTaskInstruction(
                        $labelInstruction['instruction'],
                        $labelInstruction['taskConfiguration']
                    );
                }
            }
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
                    $metadata,
                    $review,
                    $revision,
                    null
                );
            }

            if ($isObjectLabeling) {
                foreach ($labelInstructions as $labelInstruction) {
                    if ($labelInstruction['taskConfiguration'] !== null) {
                        $taskConfiguration = $this->taskConfigurationFacade->find(
                            $labelInstruction['taskConfiguration']
                        );
                        if ($taskConfiguration === null) {
                            throw new \Exception(
                                'No Task Configuration found for ' . $labelInstruction['taskConfiguration']
                            );
                        }
                        if ($user === null || $user->getId() !== $taskConfiguration->getUserId()) {
                            throw new \Exception('This User is not allowed to use this Task Configuration.');
                        }
                    }
                    $predefinedClasses = [];
                    if ($labelInstruction['instruction'] === Model\LabelingTask::INSTRUCTION_PARKED_CARS) {
                        $predefinedClasses = ['parked-car'];
                    }
                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $labelInstruction['drawingTool'],
                        $predefinedClasses,
                        $imageTypes,
                        $labelInstruction['instruction'],
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        $metadata,
                        $review,
                        $revision,
                        $labelInstruction['taskConfiguration']
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
     * @param                  $review
     * @param                  $revision
     * @param                  $taskConfigurationId
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
        $metadata,
        $review,
        $revision,
        $taskConfigurationId
    ) {
        switch ($instruction) {
            case Model\LabelingTask::INSTRUCTION_LANE:
            case Model\LabelingTask::INSTRUCTION_PARKED_CARS:
                $hideAttributeSelector = true;
                break;
            default:
                $hideAttributeSelector = false;
        }

        if ($taskConfigurationId === null) {
            $labelStructure   = $this->labelStructureService->getLabelStructureForTypeAndInstruction(
                $taskType,
                $instruction
            );
            $labelStructureUi = $this->labelStructureService->getLabelStructureUiForTypeAndInstruction(
                $taskType,
                $instruction
            );
        } else {
            $taskConfiguration     = $this->taskConfigurationFacade->find($taskConfigurationId);
            $taskConfigurationJson = $taskConfiguration->getJson();
            $labelStructure        = $taskConfigurationJson['labelStructure'];
            $labelStructureUi      = $taskConfigurationJson['labelStructureUi'];
            // Replacing the drawingTool with the given drawingTool from the task configuration
            $drawingTool = $taskConfigurationJson['drawingTool'];
        }

        $labelingTask = new Model\LabelingTask(
            $video,
            $project,
            $frameNumberMapping,
            $taskType,
            $drawingTool,
            $predefinedClasses,
            $imageTypes,
            null,
            $hideAttributeSelector,
            $taskConfigurationId
        );

        $labelingTask->setDescriptionTitle('Identify the person');
        $labelingTask->setDescriptionText(
            'How is the view on the person? ' .
            'Which side does one see from the person and from which side is the person entering the screen?'
        );

        $labelingTask->setLabelStructure(
            $labelStructure
        );
        $labelingTask->setLabelStructureUi(
            $labelStructureUi
        );
        $labelingTask->setLabelInstruction($instruction);

        $labelingTask->setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow);
        $labelingTask->setDrawingToolOptions($drawingToolOptions);
        $labelingTask->setMetaData($metadata);

        if ($review) {
            $labelingTask->setStatus(
                Model\LabelingTask::PHASE_REVIEW,
                Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION
            );
        }
        if ($revision) {
            $labelingTask->setStatus(
                Model\LabelingTask::PHASE_REVISION,
                Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION
            );
        }

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
