<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Controller\Api\v1\Organisation\Project\Exception\Missing3dVideoCalibrationData;
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
     * @var Facade\AdditionalFrameNumberMapping
     */
    private $additionalFrameNumberMappingFacade;

    /**
     * TaskCreator constructor.
     *
     * @param Facade\LabelingTask                   $taskFacade
     * @param Facade\TaskConfiguration              $taskConfigurationFacade
     * @param Facade\CalibrationData                $calibrationDataFacade
     * @param Facade\AdditionalFrameNumberMapping   $additionalFrameNumberMappingFacade
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
        Facade\AdditionalFrameNumberMapping $additionalFrameNumberMappingFacade,
        Facade\Video $videoFacade,
        Service\LabelStructure $labelStructureService,
        Service\CouchDbUpdateConflictRetry $couchDbUpdateConflictRetryService,
        \cscntLogger $logger,
        Service\TaskDatabaseCreator $taskDatabaseCreator,
        Service\TaskDatabaseSecurityPermissionService $databaseSecurityPermissionService
    ) {
        $this->taskFacade                         = $taskFacade;
        $this->calibrationDataFacade              = $calibrationDataFacade;
        $this->additionalFrameNumberMappingFacade = $additionalFrameNumberMappingFacade;
        $this->taskConfigurationFacade            = $taskConfigurationFacade;
        $this->labelStructureService              = $labelStructureService;
        $this->loggerFacade                       = new LoggerFacade($logger, self::class);
        $this->videoFacade                        = $videoFacade;
        $this->couchDbUpdateConflictRetryService  = $couchDbUpdateConflictRetryService;
        $this->taskDatabaseCreator                = $taskDatabaseCreator;
        $this->databaseSecurityPermissionService  = $databaseSecurityPermissionService;
    }

    /**
     * @param Model\Project   $project
     * @param Model\Video     $video
     * @param Model\User|null $user
     * @param bool            $labelDataImportInProgress
     *
     * @return Model\LabelingTask[]
     * @throws \Exception
     */
    public function createTasks(Model\Project $project, Model\Video $video, Model\User $user = null, $labelDataImportInProgress = false)
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
                'trapezoid'     => [
                    'minimalHeight' => 15,
                ],
            ];

            $taskVideoSettings              = $project->getTaskVideoSettings();
            $splitLength                    = (int) $taskVideoSettings['splitEach'];
            $frameSkip                      = (int) $taskVideoSettings['frameSkip'];
            $startFrameNumber               = (int) $taskVideoSettings['startFrameNumber'];
            $calibrationDataId              = $project->getCalibrationDataIdForVideo($video);
            $additionalFrameNumberMappingId = $project->getAdditionalFrameNumberMappingIdForVideo($video);
            $calibrationData                = null;
            $imageTypes                     = array_keys($video->getImageTypes());
            $framesPerVideoChunk            = $video->getMetaData()->numberOfFrames;
            $frameMappingChunks             = [];

            $videoRaw = $video->getMetaData()->raw;
            $fileInfo = pathinfo($videoRaw['format']['filename']);
            $fileExt = $fileInfo['extension'];

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

            if ($calibrationDataId === null && (in_array(Model\LabelingTask::DRAWING_TOOL_CUBOID, $drawingTools)
                    || $this->isCuboidInRequirementsXml($project))
            ) {
                throw new Missing3dVideoCalibrationData(
                    sprintf('Calibration data not found for Video: %s', $video->getName())
                );
            }

            if ($calibrationDataId !== null) {
                $calibrationData = $this->calibrationDataFacade->findById($calibrationDataId);
                if ($calibrationData === null) {
                    throw new Missing3dVideoCalibrationData(
                        sprintf('Calibration data not found for Video: %s', $video->getName())
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

            if ($video->getMetaData()->format === 'image2' && $video->getMetaData()->numberOfFrames === 1) {
                $frameMappingChunks = [[1]];
                $frameRange = new Model\FrameNumberRange(1, 1);

                $metadata = [
                    'frameRange'       => $frameRange,
                    'frameSkip'        => 1,
                    'startFrameNumber' => 1,
                ];
            } else {
                $videoFrameMapping = [];
                if ($video->getMetaData()->numberOfFrames >= ($startFrameNumber + $frameSkip)) {
                    $videoFrameMapping = range($startFrameNumber, $video->getMetaData()->numberOfFrames, $frameSkip);
                } elseif ($video->getMetaData()->numberOfFrames >= $startFrameNumber) {
                    $videoFrameMapping = [$startFrameNumber];
                }

                if ($additionalFrameNumberMappingId !== null) {
                    $additionalFrameNumberMapping = $this->additionalFrameNumberMappingFacade->findById(
                        $additionalFrameNumberMappingId
                    );
                    $videoFrameMapping            = array_unique(
                        array_merge($videoFrameMapping, $additionalFrameNumberMapping->getFrameNumberMapping())
                    );
                    asort($videoFrameMapping);
                    $videoFrameMapping = array_values($videoFrameMapping);
                }

                if ($splitLength > 0) {
                    while (count($videoFrameMapping) > 0) {
                        $frameMappingChunks[] = array_splice(
                            $videoFrameMapping,
                            0,
                            round($framesPerVideoChunk / $frameSkip)
                        );
                    }
                } else {
                    $frameMappingChunks[] = $videoFrameMapping;
                }

                $frameRange = new Model\FrameNumberRange(1, $video->getMetaData()->numberOfFrames);

                $metadata = [
                    'frameRange'       => $frameRange,
                    'frameSkip'        => $frameSkip,
                    'startFrameNumber' => $startFrameNumber,
                ];
            }

            foreach ($frameMappingChunks as $frameNumberMapping) {
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
                        $fileExt,
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
                        $fileExt,
                        $taskConfiguration
                    );
                }

                foreach ($project->getRequirementsXmlTaskInstructions() as $requirementsXmlTaskInstruction) {
                    $predefinedClasses         = [];
                    $taskType                  = null;
                    $instruction               = null;
                    $taskConfiguration         = null;
                    $previousTaskConfiguration = null;
                    $taskConfigurationId       = $requirementsXmlTaskInstruction['taskConfigurationId'];

                    if ($taskConfigurationId !== null) {
                        $taskConfiguration = $this->taskConfigurationFacade->find($taskConfigurationId);
                    }

                    if (isset($requirementsXmlTaskInstruction['previousConfigurationId'])) {
                        $previousTaskConfiguration = $this->taskConfigurationFacade->find($requirementsXmlTaskInstruction['previousConfigurationId']);
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
                        $fileExt,
                        $taskConfiguration,
                        $previousTaskConfiguration,
                        $labelDataImportInProgress
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
     * Checks if there is any shape with a drawingtool of cuboid
     *
     * @param Model\Project $project
     *
     * @return bool
     */
    private function isCuboidInRequirementsXml(Model\Project $project)
    {
        foreach ($project->getRequirementsXmlTaskInstructions() as $requirementsXmlTaskInstruction) {
            $taskConfiguration = $this->taskConfigurationFacade->find(
                $requirementsXmlTaskInstruction['taskConfigurationId']
            );
            $xmlData           = $taskConfiguration->getRawData();
            $xmlImport         = new \DOMDocument();
            $xmlImport->loadXML($xmlData);
            $xpath = new \DOMXPath($xmlImport);
            $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/requirements");

            $numberOfCuboids = $xpath->query('/x:requirements/x:thing[@shape="cuboid"]')->length;

            if ($numberOfCuboids > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video             $video
     * @param Model\Project           $project
     * @param                         $frameNumberMapping
     * @param                         $imageTypes
     * @param                         $metadata
     * @param                         $review
     * @param                         $revision
     * @param string                  $taskType
     * @param string|null             $drawingTool
     * @param string[]                $predefinedClasses
     * @param                         $instruction
     * @param int|null                $minimalVisibleShapeOverflow
     * @param array                   $drawingToolOptions
     * @param Model\TaskConfiguration $taskConfiguration
     * @param bool                    $labelDataImportInProgress
     *
     * @return Model\LabelingTask
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
        $fileExt = null,
        Model\TaskConfiguration $taskConfiguration = null,
        Model\TaskConfiguration $previousTaskConfiguration = null,
        $labelDataImportInProgress = false
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
            $xpath = $taskConfiguration->getXpathQuery();
            $minimalVisibleShapeOverflowResult = $xpath->evaluate('/r:requirements/r:options/r:minimal-visible-shape-overflow/text()');
            if ($minimalVisibleShapeOverflowResult !== false && $minimalVisibleShapeOverflowResult->length === 1) {
                $minimalVisibleShapeOverflow = (int)$minimalVisibleShapeOverflowResult->item(0)->nodeValue;
            }
            $minimalHeightResult = $xpath->evaluate('/r:requirements/r:options/r:minimal-height/text()');
            if ($minimalHeightResult !== false && $minimalHeightResult->length === 1) {
                $drawingToolOptions['rectangle']['minimalHeight']  = (int) $minimalHeightResult->item(0)->nodeValue;
                $drawingToolOptions['pedestrian']['minimalHeight'] = (int) $minimalHeightResult->item(0)->nodeValue;
                $drawingToolOptions['cuboid']['minimalHeight']     = (int) $minimalHeightResult->item(0)->nodeValue;
                $drawingToolOptions['trapezoid']['minimalHeight']  = (int) $minimalHeightResult->item(0)->nodeValue;
            }
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
        $previousTaskConfigurationId = $previousTaskConfiguration !== null
            ? $previousTaskConfiguration->getId()
            : null;

        $task = new Model\LabelingTask(
            $video,
            $project,
            $frameNumberMapping,
            $taskType,
            $drawingTool,
            $predefinedClasses,
            $imageTypes,
            $hideAttributeSelector,
            $taskConfigurationId,
            $previousTaskConfigurationId
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
        if($fileExt !== null) {
            $task->setFileExtension($fileExt);
        }

        $task->setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow);
        $task->setDrawingToolOptions($drawingToolOptions);
        $task->setMetaData($metadata);
        $task->setStatusIfAllImagesAreConverted($video);
        $task->setLabelDataImportInProgress($labelDataImportInProgress);

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
