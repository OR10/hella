<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Controller\Api\Organisation\Project\Exception\Missing3dVideoCalibrationData;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;
use crosscan\Logger\Facade\LoggerFacade;

/**
 * Simple Service to create tasks for imported videos of a certain project.
 */
class TaskCreator
{
    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @var LabelStructure
     */
    private $labelStructureService;

    /**
     * @var LoggerFacade
     */
    private $loggerFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var CouchDbUpdateConflictRetry
     */
    private $couchDbUpdateConflictRetryService;

    /**
     * @var TaskDatabaseCreator
     */
    private $taskDatabaseCreator;

    /**
     * @var TaskDatabaseSecurityPermissionService
     */
    private $databaseSecurityPermissionService;

    /**
     * TaskCreator constructor.
     *
     * @param Facade\LabelingTask                   $taskFacade
     * @param Facade\TaskConfiguration              $taskConfigurationFacade
     * @param Facade\CalibrationData                $calibrationDataFacade
     * @param Facade\Video                          $videoFacade
     * @param LabelStructure                        $labelStructureService
     * @param CouchDbUpdateConflictRetry            $couchDbUpdateConflictRetryService
     * @param \cscntLogger                          $logger
     * @param TaskDatabaseCreator                   $taskDatabaseCreator
     * @param TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
     */
    public function __construct(
        Facade\LabelingTask $taskFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Facade\Video $videoFacade,
        Service\LabelStructure $labelStructureService,
        Service\CouchDbUpdateConflictRetry $couchDbUpdateConflictRetryService,
        \cscntLogger $logger,
        Service\TaskDatabaseCreator $taskDatabaseCreator,
        Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
    ) {
        $this->taskFacade                        = $taskFacade;
        $this->calibrationDataFacade             = $calibrationDataFacade;
        $this->taskConfigurationFacade           = $taskConfigurationFacade;
        $this->labelStructureService             = $labelStructureService;
        $this->loggerFacade                      = new LoggerFacade($logger, self::class);
        $this->videoFacade                       = $videoFacade;
        $this->couchDbUpdateConflictRetryService = $couchDbUpdateConflictRetryService;
        $this->taskDatabaseCreator               = $taskDatabaseCreator;
        $this->databaseSecurityPermissionService = $databaseSecurityPermissionService;
    }

    /**
     * @param Model\Project   $project
     * @param Model\Video     $video
     * @param Model\User|null $user
     *
     * @return Model\LabelingTask[]
     * @throws \Exception
     */
    public function createTasks(Model\Project $project, Model\Video $video, Model\User $user = null)
    {
        $this->loggerFacade->logString(
            sprintf(
                'Start creating tasks for project %s and video %s (as %s)',
                $project->getId(),
                $video->getId(),
                $user !== null ? $user->getUsername() : 'unknown'
            ),
            \cscntLogPayload::SEVERITY_DEBUG
        );

        $tasks = [];

        try {
            if (!$project->hasVideo($video->getName())) {
                throw new \InvalidArgumentException(
                    sprintf('Video %s is not assigned to project %s', $video->getId(), $project->getId())
                );
            }

            // define some sane defaults for legacy task instructions,
            // these will be overwritten by values of the task configuration for genericXml instructions
            $minimalVisibleShapeOverflow = null;
            $drawingToolOptions          = [
                'pedestrian' => [
                    'minimalHeight' => 22,
                ],
                'cuboid'     => [
                    'minimalHeight' => 15,
                ],
                'polygon'     => [
                    'minHandles' => 3,
                    'maxHandles' => 15,
                ],
            ];

            $taskVideoSettings   = $project->getTaskVideoSettings();
            $splitLength         = (int) $taskVideoSettings['splitEach'];
            $frameSkip           = (int) $taskVideoSettings['frameSkip'];
            $startFrameNumber    = (int) $taskVideoSettings['startFrameNumber'];
            $calibrationDataId   = $project->getCalibrationDataIdForVideo($video);
            $calibrationData     = null;
            $imageTypes          = array_keys($video->getImageTypes());
            $framesPerVideoChunk = $video->getMetaData()->numberOfFrames;
            $videoFrameMapping   = [];
            if ($video->getMetaData()->numberOfFrames >= ($startFrameNumber + $frameSkip)) {
                $videoFrameMapping = range($startFrameNumber, $video->getMetaData()->numberOfFrames, $frameSkip);
            } elseif ($video->getMetaData()->numberOfFrames >= $startFrameNumber) {
                $videoFrameMapping = [$startFrameNumber];
            }
            $frameMappingChunks  = [];

            $legacyDrawingTools     = array_map(
                function ($instruction) {
                    return $instruction['drawingTool'];
                },
                $project->getLegacyTaskInstructions()
            );
            $genericXmlDrawingTools = array_map(
                function ($instruction) {
                    return $instruction['drawingTool'];
                },
                $project->getLegacyTaskInstructions()
            );

            $drawingTools = array_unique(array_merge($legacyDrawingTools, $genericXmlDrawingTools));

            if ($calibrationDataId === null && in_array(Model\LabelingTask::DRAWING_TOOL_CUBOID, $drawingTools)) {
                throw new Missing3dVideoCalibrationData(
                    sprintf('Calibration data not found: %s', $calibrationDataId)
                );
            }

            if ($calibrationDataId !== null) {
                $calibrationData = $this->calibrationDataFacade->findById($calibrationDataId);
                if ($calibrationData === null) {
                    throw new Missing3dVideoCalibrationData(
                        sprintf('Calibration data not found: %s', $calibrationDataId)
                    );
                }

                $this->couchDbUpdateConflictRetryService->save(
                    $video,
                    function (Model\Video $video) use ($calibrationData) {
                        $video->setCalibrationData($calibrationData);
                    }
                );
            }

            if ($splitLength > 0) {
                $framesPerVideoChunk = min($framesPerVideoChunk, round($splitLength * $video->getMetaData()->fps));
            }

            while (count($videoFrameMapping) > 0) {
                $frameMappingChunks[] = array_splice($videoFrameMapping, 0, round($framesPerVideoChunk / $frameSkip));
            }

            foreach ($frameMappingChunks as $frameNumberMapping) {
                $frameRange = new Model\FrameNumberRange(1, $video->getMetaData()->numberOfFrames);

                $metadata = [
                    'frameRange'       => $frameRange,
                    'frameSkip'        => $frameSkip,
                    'startFrameNumber' => $startFrameNumber,
                ];

                foreach ($project->getLegacyTaskInstructions() as $legacyTaskInstruction) {
                    $predefinedClasses = [];
                    if ($legacyTaskInstruction['instruction'] === Model\LabelingTask::INSTRUCTION_PARKED_CARS) {
                        $predefinedClasses = ['parked-car'];
                    }
                    if ($legacyTaskInstruction['instruction'] === Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE) {
                        $predefinedClasses = ['ignore-vehicle'];
                    }

                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        $imageTypes,
                        $metadata,
                        $project->hasReviewValidationProcess(),
                        $project->hasRevisionValidationProcess(),
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $legacyTaskInstruction['drawingTool'],
                        $predefinedClasses,
                        $legacyTaskInstruction['instruction'],
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        null
                    );
                }

                foreach ($project->getGenericXmlTaskInstructions() as $genericXmlTaskInstruction) {
                    $predefinedClasses   = [];
                    $taskType            = null;
                    $instruction         = null;
                    $taskConfigurationId = $genericXmlTaskInstruction['taskConfigurationId'];

                    if ($taskConfigurationId !== null) {
                        $taskConfiguration = $this->taskConfigurationFacade->find($taskConfigurationId);
                    } else {
                        $taskConfiguration = null;
                    }

                    $this->checkGenericXmlTaskInstructionPermissions($genericXmlTaskInstruction, $user);

                    if ($taskConfiguration instanceof Model\TaskConfiguration\SimpleXml) {
                        if ($genericXmlTaskInstruction['instruction'] === Model\LabelingTask::INSTRUCTION_PARKED_CARS) {
                            $predefinedClasses = ['parked-car'];
                        }

                        $taskType = $taskConfiguration->isMetaLabelingConfiguration()
                            ? Model\LabelingTask::TYPE_META_LABELING
                            : Model\LabelingTask::TYPE_OBJECT_LABELING;
                    }

                    $instruction = $genericXmlTaskInstruction['instruction'];

                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        $imageTypes,
                        $metadata,
                        $project->hasReviewValidationProcess(),
                        $project->hasRevisionValidationProcess(),
                        $taskType,
                        null,
                        $predefinedClasses,
                        $instruction,
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        $taskConfiguration
                    );
                }

                foreach ($project->getRequirementsXmlTaskInstructions() as $requirementsXmlTaskInstruction) {
                    $predefinedClasses   = [];
                    $taskType            = null;
                    $instruction         = null;
                    $taskConfigurationId = $requirementsXmlTaskInstruction['taskConfigurationId'];

                    if ($taskConfigurationId !== null) {
                        $taskConfiguration = $this->taskConfigurationFacade->find($taskConfigurationId);
                    } else {
                        $taskConfiguration = null;
                    }

                    $this->checkGenericXmlTaskInstructionPermissions($requirementsXmlTaskInstruction, $user);

                    $instruction = $requirementsXmlTaskInstruction['instruction'];

                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        $imageTypes,
                        $metadata,
                        $project->hasReviewValidationProcess(),
                        $project->hasRevisionValidationProcess(),
                        $taskType,
                        null,
                        $predefinedClasses,
                        $instruction,
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        $taskConfiguration
                    );
                }
            }
        } catch (\Exception $exception) {
            $this->loggerFacade->logException($exception, \cscntLogPayload::SEVERITY_ERROR);
            throw $exception;
        }

        return $tasks;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video             $video
     * @param Model\Project           $project
     * @param                         $frameNumberMapping
     * @param string                  $taskType
     * @param string|null             $drawingTool
     * @param string[]                $predefinedClasses
     * @param                         $imageTypes
     * @param                         $instruction
     * @param int|null                $minimalVisibleShapeOverflow
     * @param                         $drawingToolOptions
     * @param                         $metadata
     * @param                         $review
     * @param                         $revision
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return Model\LabelingTask
     *
     */
    private function addTask(
        Model\Video $video,
        Model\Project $project,
        $frameNumberMapping,
        $imageTypes,
        $metadata,
        $review,
        $revision,
        $taskType = null,
        $drawingTool = null,
        $predefinedClasses = [],
        $instruction = null,
        $minimalVisibleShapeOverflow = null,
        $drawingToolOptions = [],
        Model\TaskConfiguration $taskConfiguration = null
    ) : Model\LabelingTask
    {
        switch ($instruction) {
            case Model\LabelingTask::INSTRUCTION_LANE:
            case Model\LabelingTask::INSTRUCTION_PARKED_CARS:
            case Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE:
                $hideAttributeSelector = true;
                break;
            default:
                $hideAttributeSelector = false;
        }

        $labelStructure   = null;
        $labelStructureUi = null;
        if ($taskConfiguration instanceof Model\TaskConfiguration\SimpleXml) {
            $taskConfigurationJson = $taskConfiguration->getJson();
            $labelStructure        = $taskConfigurationJson['labelStructure'];
            $labelStructureUi      = $taskConfigurationJson['labelStructureUi'];
            // Replacing the drawingTool with the given drawingTool from the task configuration
            $drawingTool                 = $taskConfigurationJson['drawingTool'];
            $drawingToolOptions          = $taskConfigurationJson['drawingToolOptions'];
            $minimalVisibleShapeOverflow = $taskConfigurationJson['minimalVisibleShapeOverflow'];
        } elseif ($taskConfiguration instanceof Model\TaskConfiguration\RequirementsXml) {
            $taskType = Model\LabelingTask::TYPE_OBJECT_LABELING;
        } else {
            $labelStructure   = $this->labelStructureService->getLabelStructureForTypeAndInstruction(
                $taskType,
                $instruction
            );
            $labelStructureUi = $this->labelStructureService->getLabelStructureUiForTypeAndInstruction(
                $taskType,
                $instruction
            );
        }

        $taskConfigurationId = $taskConfiguration !== null
            ? $taskConfiguration->getId()
            : null;

        $task = new Model\LabelingTask(
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

        $task->setDescriptionTitle('Identify the person');
        $task->setDescriptionText(
            'How is the view on the person? ' .
            'Which side does one see from the person and from which side is the person entering the screen?'
        );

        if ($labelStructure !== null) {
            $task->setLabelStructure($labelStructure);
        }
        if ($labelStructureUi !== null) {
            $task->setLabelStructureUi($labelStructureUi);
        }
        if ($instruction !== null) {
            $task->setLabelInstruction($instruction);
        }

        $task->setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow);
        $task->setDrawingToolOptions($drawingToolOptions);
        $task->setMetaData($metadata);
        $task->setStatusIfAllImagesAreConverted($video);

        if ($review) {
            $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION);
        }

        if ($revision) {
            $task->setStatus(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION);
        }

        $this->taskFacade->save($task);

        $this->loggerFacade->logString(
            sprintf('Created tasks with id %s', $task->getId()),
            \cscntLogPayload::SEVERITY_DEBUG
        );

        $this->createTaskDatabase($project, $task);

        $this->databaseSecurityPermissionService->updateForTask($task);

        $this->loggerFacade->logString(
            sprintf('Created task database with project id %s and task id %s', $project->getId(), $task->getId()),
            \cscntLogPayload::SEVERITY_DEBUG
        );

        return $task;
    }

    private function createTaskDatabase(Model\Project $project, Model\LabelingTask $task)
    {
        return $this->taskDatabaseCreator->createDatabase($project, $task);
    }

    /**
     * @param array      $labelInstruction
     *
     * @param Model\User $user
     *
     * @throws \Exception
     */
    private function checkGenericXmlTaskInstructionPermissions(array $labelInstruction, Model\User $user = null)
    {
        $taskConfiguration = $this->taskConfigurationFacade->find($labelInstruction['taskConfigurationId']);

        if ($taskConfiguration === null) {
            throw new \Exception(
                sprintf('No Task Configuration found for %s', $labelInstruction['taskConfigurationId'])
            );
        }

        if ($user === null || $user->getId() !== $taskConfiguration->getUserId()) {
            throw new \Exception('This User is not allowed to use this Task Configuration.');
        }
    }
}
