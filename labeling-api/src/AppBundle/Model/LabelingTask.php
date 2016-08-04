<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class LabelingTask
{
    const TYPE_META_LABELING = 'meta-labeling';
    const TYPE_OBJECT_LABELING = 'object-labeling';

    const DRAWING_TOOL_RECTANGLE = 'rectangle';
    const DRAWING_TOOL_PEDESTRIAN = 'pedestrian';
    const DRAWING_TOOL_CUBOID = 'cuboid';

    const INSTRUCTION_VEHICLE = 'vehicle';
    const INSTRUCTION_PERSON = 'person';
    const INSTRUCTION_CYCLIST = 'cyclist';
    const INSTRUCTION_IGNORE = 'ignore';
    const INSTRUCTION_IGNORE_VEHICLE = 'ignore-vehicle';
    const INSTRUCTION_LANE = 'lane';

    const STATUS_PREPROCESSING = 'preprocessing';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_TODO = 'todo';
    const STATUS_DONE = 'done';

    const PHASE_LABELING = 'labeling';
    const PHASE_REVIEW = 'review';
    const PHASE_REVISION = 'revision';

    /**
     * @var string
     * @CouchDB\Id
     * @Serializer\Groups({"statistics"})
     */
    private $id;

    /**
     * @var string
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @var string|null
     * @CouchDB\Field(type="string")
     */
    private $userId;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $videoId;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $descriptionTitle;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $descriptionText;

    /**
     * Required image types for this task in order of preference.
     *
     * @var array
     * @CouchDB\Field(type="mixed")
     */
    private $requiredImageTypes;

    /**
     * @var array
     * @CouchDB\Field(type="mixed")
     * @Serializer\Groups({"statistics"})
     */
    private $status = [self::PHASE_LABELING => self::STATUS_PREPROCESSING];

    /**
     * @var string
     * @CouchDB\Field(type="string")
     * @Serializer\Groups({"statistics"})
     */
    private $taskType;

    /**
     * @var array
     * @CouchDB\Field(type="mixed")
     */
    private $predefinedClasses;

    /**
     * @var string|null
     * @CouchDB\Field(type="mixed")
     */
    private $drawingTool;

    /**
     * @var array
     * @CouchDB\Field(type="mixed")
     */
    private $drawingToolOptions = array();

    /**
     * @var string|null
     * @CouchDB\Field(type="mixed")
     */
    private $assignmentHistory = null;

    /**
     * @var string|null
     * @CouchDB\Field(type="mixed")
     */
    private $labelStructure = null;

    /**
     * @var string|null
     * @CouchDB\Field(type="mixed")
     */
    private $labelStructureUi = null;

    /**
     * @var string|null
     * @CouchDB\Field(type="mixed")
     */
    private $labelInstruction = null;

    /**
     * @var string|null
     * @CouchDB\Field(type="mixed")
     */
    private $minimalVisibleShapeOverflow = null;

    /**
     * @var array
     * @CouchDB\Field(type="mixed")
     */
    private $frameNumberMapping = array();

    /**
     * @var array
     * @CouchDB\Field(type="mixed")
     * @Serializer\Groups({"statistics"})
     */
    private $metaData = array();

    /**
     * @var bool
     * @CouchDB\Field(type="boolean")
     */
    private $reopen = false;

    /**
     * @var \DateTime
     * @CouchDB\Field(type="datetime")
     */
    private $createdAt;

    /**
     * @var bool
     * @CouchDB\Field(type="boolean")
     */
    private $hideAttributeSelector = false;

    /**
     * @param Video     $video
     * @param Project   $project
     * @param array     $frameNumberMapping
     * @param string    $taskType
     * @param string    $drawingTool
     * @param array     $predefinedClasses
     * @param array     $requiredImageTypes
     * @param \DateTime $createdAt
     * @param           $hideAttributeSelector
     * @return LabelingTask
     */
    public static function create(
        Video $video,
        Project $project,
        array $frameNumberMapping,
        $taskType,
        $drawingTool = null,
        $predefinedClasses = array(),
        array $requiredImageTypes = array(),
        \DateTime $createdAt = null,
        $hideAttributeSelector = false
    ) {
        return new static(
            $video,
            $project,
            $frameNumberMapping,
            $taskType,
            $drawingTool,
            $predefinedClasses,
            $requiredImageTypes,
            $createdAt,
            $hideAttributeSelector
        );
    }

    /**
     * @param Video     $video
     * @param Project   $project
     * @param array     $frameNumberMapping
     * @param string    $taskType
     * @param string    $drawingTool
     * @param array     $predefinedClasses
     * @param array     $requiredImageTypes
     * @param \DateTime $createdAt
     * @param bool      $hideAttributeSelector
     */
    public function __construct(
        Video $video,
        Project $project,
        array $frameNumberMapping,
        $taskType,
        $drawingTool = null,
        $predefinedClasses = array(),
        array $requiredImageTypes = array(),
        \DateTime $createdAt = null,
        $hideAttributeSelector = false
    ) {
        $this->videoId               = $video->getId();
        $this->projectId             = $project->getId();
        $this->frameNumberMapping    = $frameNumberMapping;
        $this->taskType              = $taskType;
        $this->drawingTool           = $drawingTool;
        $this->predefinedClasses     = $predefinedClasses;
        $this->requiredImageTypes    = $requiredImageTypes;
        $this->hideAttributeSelector = $hideAttributeSelector;
        if ($createdAt === null) {
            $this->createdAt = new \DateTime();
        } else {
            $this->createdAt = $createdAt;
        }
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $userId
     *
     * @return LabelingTask
     */
    public function setUserId($userId)
    {
        $this->userId = $userId;

        return $this;
    }

    /**
     * @return string
     */
    public function getVideoId()
    {
        return $this->videoId;
    }

    /**
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @return array
     */
    public function getRequiredImageTypes()
    {
        return $this->requiredImageTypes;
    }

    /**
     * @return string
     */
    public function getDescriptionText()
    {
        return $this->descriptionText;
    }

    /**
     * @param string $descriptionText
     *
     * @return LabelingTask
     */
    public function setDescriptionText($descriptionText)
    {
        $this->descriptionText = $descriptionText;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescriptionTitle()
    {
        return $this->descriptionTitle;
    }

    /**
     * @param string $descriptionTitle
     *
     * @return LabelingTask
     */
    public function setDescriptionTitle($descriptionTitle)
    {
        $this->descriptionTitle = $descriptionTitle;

        return $this;
    }

    /**
     * @return string
     */
    public function getTaskType()
    {
        return $this->taskType;
    }

    /**
     * @return string
     */
    public function getDrawingTool()
    {
        return $this->drawingTool;
    }

    /**
     * @return array
     */
    public function getPredefinedClasses()
    {
        return $this->predefinedClasses;
    }

    /**
     * @param           $phase
     * @param string    $status
     * @return $this
     */
    public function setStatus($phase, $status)
    {
        $this->status[$phase] = $status;

        return $this;
    }

    /**
     * @param $phase
     * @return array
     */
    public function getStatus($phase)
    {
        return $this->status[$phase];
    }

    /**
     * @return array
     */
    public function getRawStatus()
    {
        return $this->status;
    }

    /**
     * @param Video $video
     *
     * @return $this|void
     */
    public function setStatusIfAllImagesAreConverted(Video $video)
    {
        foreach ($this->getRequiredImageTypes() as $requiredImageType) {
            if (!$video->isImageTypeConverted($requiredImageType)) {
                return;
            }
        }
        $this->setStatus(self::PHASE_LABELING, self::STATUS_TODO);

        return $this;
    }

    /**
     * @param $phase
     * @return int|null
     */
    public function getLatestAssignedUserIdForPhase($phase)
    {
        $historyEntries = $this->getAssignmentHistory();
        if (empty($historyEntries)) {
            return null;
        }

        $historyEntries = array_filter($historyEntries, function($history) use ($phase) {
            return ($history['phase'] === $phase);
        });

        usort($historyEntries, function ($a, $b) {
            if ($a['createdAt'] === $b['createdAt']) {
                return 0;
            }
            return ($a['createdAt'] < $b['createdAt']) ? -1 : 1;
        });

        return $historyEntries[0]['userId'];
    }

    /**
     * @return null|string
     */
    public function getLabelStructureUi()
    {
        return $this->labelStructureUi;
    }

    /**
     * @param null|string $labelStructureUi
     */
    public function setLabelStructureUi($labelStructureUi)
    {
        $this->labelStructureUi = $labelStructureUi;
    }

    /**
     * @return null|string
     */
    public function getLabelStructure()
    {
        return $this->labelStructure;
    }

    /**
     * @param null|string $labelStructure
     */
    public function setLabelStructure($labelStructure)
    {
        $this->labelStructure = $labelStructure;
    }

    /**
     * @return null|string
     */
    public function getLabelInstruction()
    {
        return $this->labelInstruction;
    }

    /**
     * @param null|string $labelInstruction
     */
    public function setLabelInstruction($labelInstruction)
    {
        $this->labelInstruction = $labelInstruction;
    }

    /**
     * @return null|string
     */
    public function getMinimalVisibleShapeOverflow()
    {
        return $this->minimalVisibleShapeOverflow;
    }

    /**
     * @param null|string $minimalVisibleShapeOverflow
     */
    public function setMinimalVisibleShapeOverflow($minimalVisibleShapeOverflow)
    {
        $this->minimalVisibleShapeOverflow = $minimalVisibleShapeOverflow;
    }

    /**
     * @return array
     */
    public function getDrawingToolOptions()
    {
        return $this->drawingToolOptions;
    }

    /**
     * @param array $drawingToolOptions
     */
    public function setDrawingToolOptions($drawingToolOptions)
    {
        $this->drawingToolOptions = $drawingToolOptions;
    }

    /**
     * @return array
     */
    public function getFrameNumberMapping()
    {
        return $this->frameNumberMapping;
    }

    /**
     * @param array $frameNumberMapping
     */
    public function setFrameNumberMapping($frameNumberMapping)
    {
        $this->frameNumberMapping = $frameNumberMapping;
    }

    /**
     * @return array
     */
    public function getMetaData()
    {
        return $this->metaData;
    }

    /**
     * @param array $metaData
     */
    public function setMetaData($metaData)
    {
        $this->metaData = $metaData;
    }

    /**
     * @param boolean $reopen
     */
    public function setReopen($reopen)
    {
        $this->reopen = $reopen;
    }

    /**
     * @return boolean
     */
    public function isReopen()
    {
        return $this->reopen;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param string $projectId
     */
    public function setProjectId($projectId)
    {
        $this->projectId = $projectId;
    }

    /**
     * @return string
     */
    public function getRev()
    {
        return $this->rev;
    }

    /**
     * @return null|string
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @return null|string
     */
    public function getAssignmentHistory()
    {
        return $this->assignmentHistory;
    }

    /**
     * @param User      $user
     * @param \DateTime $date
     * @param           $phase
     * @param           $status
     */
    public function addAssignmentHistory(User $user = null, \DateTime $date, $phase, $status)
    {
        $this->assignmentHistory[] = [
            $user instanceof User ? $user->getId() : null,
            $date->getTimestamp(),
            $phase,
            $status
        ];
    }
}
