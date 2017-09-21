<?php

namespace AnnoStationBundle\Tests\Helper;

use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;

/**
 * Helper class to create projects.
 */
class ProjectBuilder
{
    /**
     * @var string|null
     */
    private $id = null;

    /**
     * @var string
     */
    private $name = 'Test project';

    /**
     * @var string
     */
    private $owningUserId;

    /**
     * @var string
     */
    private $currentStatus = Model\Project::STATUS_TODO;

    /**
     * @var array
     */
    private $statusChanges = [];

    /**
     * @var \DateTime
     */
    private $creationDate;

    /**
     * @var \DateTime
     */
    private $dueDate;

    /**
     * @var array
     */
    private $phases = [];

    /**
     * @var array
     */
    private $legacyTaskInstruction = [];

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\CalibrationData
     */
    private $calibrationData;

    /**
     * @var array
     */
    private $labelManagersAssignments = [];

    /**
     * @var string
     */
    private $labelingGroupId;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var Model\TaskConfiguration\RequirementsXml
     */
    private $requirementsXmlId;

    /**
     * @var int
     */
    private $frameSkip = 1;

    /**
     * @var int
     */
    private $startFrameNumber = 1;

    /**
     * @var int
     */
    private $splitEach = 0;

    /**
     * @var array
     */
    private $additionalFrameNumberMappings = [];

    /**
     * Declare a private constructor to enforce usage of fluent interface.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     */
    private function __construct(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->organisation = $organisation;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return ProjectBuilder
     */
    public static function create(AnnoStationBundleModel\Organisation $organisation)
    {
        return new self($organisation);
    }

    /**
     * @param string $id
     *
     * @return ProjectBuilder
     */
    public function withId(string $id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @param string $name
     *
     * @return ProjectBuilder
     */
    public function withName(string $name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @param string $userId
     *
     * @return ProjectBuilder
     */
    public function withProjectOwnedByUserId(string $userId)
    {
        $this->owningUserId = $userId;

        return $this;
    }

    /**
     * @param string          $status
     * @param \DateTime|null  $changedAt
     * @param Model\User|null $changedBy
     *
     * @return ProjectBuilder
     */
    public function withStatusChange(string $status, \DateTime $changedAt = null, Model\User $changedBy = null)
    {
        if ($changedAt === null) {
            if (empty($this->statusChanges)) {
                $changedAt = new \DateTime();
            } else {
                $changedAt = clone end($this->statusChanges)['changedAt'];
                $changedAt->modify('+1 second');
            }
        }

        $this->currentStatus   = $status;
        $this->statusChanges[] = [
            'status'    => $status,
            'changedAt' => $changedAt ?: new \DateTime(),
            'changedBy' => $changedBy,
        ];

        return $this;
    }

    /**
     * @return $this
     */
    public function withEmptyLabelManagerAssignments()
    {
        $this->labelManagersAssignments = [];

        return $this;
    }

    /**
     * @param Model\User     $labelManager
     * @param \DateTime|null $dateTime
     *
     * @return $this
     */
    public function withAddedLabelManagerAssignment(Model\User $labelManager, \DateTime $dateTime = null)
    {
        $this->labelManagersAssignments[] = [
            'labelManager' => $labelManager,
            'dateTime'     => $dateTime,
        ];

        return $this;
    }

    /**
     * @param \DateTime $creationDate
     *
     * @return ProjectBuilder
     */
    public function withCreationDate(\DateTime $creationDate)
    {
        $this->creationDate = $creationDate;

        return $this;
    }

    /**
     * @param \DateTime $dueDate
     *
     * @return $this
     */
    public function withDueDate(\DateTime $dueDate)
    {
        $this->dueDate = $dueDate;

        return $this;
    }

    /**
     * @param array $phases
     *
     * @return $this
     */
    public function withPhases(array $phases)
    {
        $this->phases = $phases;

        return $this;
    }

    /**
     * @param array $instruction
     *
     * @return $this
     */
    public function withLegacyTaskInstruction(array $instruction)
    {
        $this->legacyTaskInstruction = $instruction;

        return $this;
    }

    /**
     * @param Model\Video $video
     *
     * @return $this
     */
    public function withVideo(Model\Video $video)
    {
        $this->video = $video;

        return $this;
    }

    /**
     * @param Model\CalibrationData $calibrationData
     *
     * @return $this
     */
    public function withCalibrationData(Model\CalibrationData $calibrationData)
    {
        $this->calibrationData = $calibrationData;

        return $this;
    }

    /**
     * @param Model\LabelingGroup $labelingGroup
     *
     * @return $this
     */
    public function withLabelGroup(Model\LabelingGroup $labelingGroup)
    {
        $this->labelingGroupId = $labelingGroup->getId();

        return $this;
    }

    /**
     * @param $skip
     *
     * @return $this
     */
    public function withFrameSkip($skip)
    {
        $this->frameSkip = $skip;

        return $this;
    }

    /**
     * @param $startFrameNumber
     *
     * @return $this
     */
    public function withStartFrameNumber($startFrameNumber)
    {
        $this->startFrameNumber = $startFrameNumber;

        return $this;
    }

    /**
     * @param $splitEach
     *
     * @return $this
     */
    public function withSplitEach($splitEach)
    {
        $this->splitEach = $splitEach;

        return $this;
    }

    /**
     * @param $additionalFrameNumberMappings
     *
     * @return $this
     */
    public function withAdditionalFrameNumberMappings($additionalFrameNumberMappings)
    {
        $this->additionalFrameNumberMappings = $additionalFrameNumberMappings;

        return $this;
    }

    public function withRequirementsXmlConfigurationId($id)
    {
        $this->requirementsXmlId = $id;

        return $this;
    }

    /**
     * @return array
     */
    public function buildArray()
    {
        return [
            'id'                         => $this->id,
            'name'                       => $this->name,
            'status'                     => $this->currentStatus,
            'finishedPercentage'         => 0,
            'creationTimestamp'          => $this->creationDate ? $this->creationDate->getTimestamp() : 0,
            'taskInPreProcessingCount'   => 0,
            'taskCount'                  => 0,
            'taskFinishedCount'          => 0,
            'taskInProgressCount'        => 0,
            'totalLabelingTimeInSeconds' => 0,
            'labeledThingInFramesCount'  => 0,
            'videosCount'                => 0,
            'dueTimestamp'               => null,
            'taskFailedCount'            => 0,
            'labelManager'               => $this->getLatestAssignedLabelManagerUserId(),
            'taskInstructionType'        => 'legacy',
            'diskUsage'                  => ['total' => 0],
            'campaigns'                  => [],
            'labelingGroupId'            => null,
            'userId'                     => $this->owningUserId,
        ];
    }

    /**
     * @return Model\Project
     */
    public function build()
    {
        $creationDate = $this->creationDate === null ? null : clone $this->creationDate;

        if (empty($this->legacyTaskInstruction) && $this->requirementsXmlId === null) {
            $this->withLegacyTaskInstruction(
                [
                    [
                        'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                        'drawingTool' => Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                    ],
                ]
            );
        }

        $project = Model\Project::create(
            $this->name,
            $this->organisation,
            null,
            $creationDate,
            $this->dueDate,
            $this->phases,
            $this->frameSkip,
            $this->startFrameNumber,
            $this->splitEach
        );

        foreach ($this->additionalFrameNumberMappings as $additionalFrameNumberMapping) {
            $project->addAdditionalFrameNumberMapping($additionalFrameNumberMapping);
        }

        if ($this->owningUserId !== null) {
            $project->setUserId($this->owningUserId);
        }

        if ($this->video !== null) {
            $project->addVideo($this->video);
        }

        if ($this->calibrationData !== null) {
            $project->addCalibrationData($this->calibrationData);
        }

        if ($this->labelingGroupId !== null) {
            $project->setLabelingGroupId($this->labelingGroupId);
        }

        if ($this->requirementsXmlId !== null) {
            $project->addRequirementsXmlTaskInstruction('test_instruction', $this->requirementsXmlId);
        }

        foreach ($this->statusChanges as $change) {
            $project->addStatusHistory($change['changedAt'], $change['status'], $change['changedBy']);
        }

        foreach ($this->labelManagersAssignments as $labelManagerAssignment) {
            $project->addLabelManagerAssignmentHistory(
                $labelManagerAssignment['labelManager'],
                $labelManagerAssignment['dateTime']
            );
        }

        foreach ($this->legacyTaskInstruction as $instruction) {
            $project->addLegacyTaskInstruction($instruction['instruction'], $instruction['drawingTool']);
        }

        return $project;
    }

    /**
     * @return null
     */
    private function getLatestAssignedLabelManagerUserId()
    {
        $historyEntries = $this->labelManagersAssignments;
        if (empty($historyEntries)) {
            return null;
        }

        usort(
            $historyEntries,
            function ($a, $b) {
                if ($a['assignedAt'] === $b['assignedAt']) {
                    return 0;
                }

                return ($a['assignedAt'] > $b['assignedAt']) ? -1 : 1;
            }
        );

        return $historyEntries[0]['userId'];
    }
}
