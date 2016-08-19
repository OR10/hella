<?php

namespace AppBundle\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
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
     * TaskCreator constructor.
     *
     * @param Facade\LabelingTask      $taskFacade
     * @param Facade\TaskConfiguration $taskConfigurationFacade
     * @param Facade\CalibrationData   $calibrationDataFacade
     * @param LabelStructure           $labelStructureService
     * @param \cscntLogger             $logger
     */
    public function __construct(
        Facade\LabelingTask $taskFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Service\LabelStructure $labelStructureService,
        \cscntLogger $logger
    ) {
        $this->taskFacade              = $taskFacade;
        $this->calibrationDataFacade   = $calibrationDataFacade;
        $this->taskConfigurationFacade = $taskConfigurationFacade;
        $this->labelStructureService   = $labelStructureService;
        $this->loggerFacade            = new LoggerFacade($logger, self::class);
    }

    /**
     * @param Model\User    $user
     * @param Model\Project $project
     * @param Model\Video   $video
     *
     * @return Model\LabelingTask[]
     *
     * @throws \Exception
     */
    public function createTasks(Model\User $user, Model\Project $project, Model\Video $video)
    {
        $this->loggerFacade->logString(
            sprintf(
                'Start creating tasks as user %s for project %s and video %s',
                $user->getUsername(),
                $project->getId(),
                $video->getId()
            ),
            \cscntLogPayload::SEVERITY_DEBUG
        );

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
            ];

            $tasks               = [];
            $taskVideoSettings   = $project->getTaskVideoSettings();
            $splitLength         = (int) $taskVideoSettings['splitEach'];
            $frameSkip           = (int) $taskVideoSettings['frameSkip'];
            $startFrameNumber    = (int) $taskVideoSettings['startFrameNumber'];
            $calibrationDataId   = $project->getCalibrationDataIdForVideo($video);
            $calibrationData     = null;
            $imageTypes          = array_keys($video->getImageTypes());
            $framesPerVideoChunk = $video->getMetaData()->numberOfFrames;
            $videoFrameMapping   = range($startFrameNumber, $video->getMetaData()->numberOfFrames, $frameSkip);
            $frameMappingChunks  = [];

            if ($calibrationDataId !== null) {
                $calibrationData = $this->calibrationDataFacade->findById($calibrationDataId);
                if ($calibrationData === null) {
                    throw new \Exception(sprintf('Calibration data not found: %s', $calibrationDataId));
                }
                $video->setCalibrationData($calibrationData);
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
                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $legacyTaskInstruction['drawingTool'],
                        ['pedestrian'],
                        $imageTypes,
                        $legacyTaskInstruction['instruction'],
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        $metadata,
                        $project->hasReviewValidationProcess(),
                        $project->hasRevisionValidationProcess(),
                        null
                    );
                }

                foreach ($project->getGenericXmlTaskInstructions() as $genericXmlTaskInstruction) {
                    $this->checkGenericXmlTaskInstructionPermissions($user, $genericXmlTaskInstruction);

                    $tasks[] = $this->addTask(
                        $video,
                        $project,
                        $frameNumberMapping,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        null,
                        ['pedestrian'],
                        $imageTypes,
                        $genericXmlTaskInstruction['instruction'],
                        $minimalVisibleShapeOverflow,
                        $drawingToolOptions,
                        $metadata,
                        $project->hasReviewValidationProcess(),
                        $project->hasRevisionValidationProcess(),
                        $genericXmlTaskInstruction['taskConfigurationId']
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
        $hideAttributeSelector = $instruction === Model\LabelingTask::INSTRUCTION_LANE ? true : false;

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
            $drawingTool                 = $taskConfigurationJson['drawingTool'];
            $drawingToolOptions          = $taskConfigurationJson['drawingToolOptions'];
            $minimalVisibleShapeOverflow = $taskConfigurationJson['minimalVisibleShapeOverflow'];
        }

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

        $task->setLabelStructure($labelStructure);
        $task->setLabelStructureUi($labelStructureUi);
        $task->setLabelInstruction($instruction);

        $task->setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow);
        $task->setDrawingToolOptions($drawingToolOptions);
        $task->setMetaData($metadata);

        if ($review) {
            $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION);
        }

        if ($revision) {
            $task->setStatus(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION);
        }

        $this->taskFacade->save($task);

        return $task;
    }

    /**
     * @param Model\User $user
     * @param array      $labelInstruction
     *
     * @throws \Exception
     */
    private function checkGenericXmlTaskInstructionPermissions(Model\User $user, array $labelInstruction)
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