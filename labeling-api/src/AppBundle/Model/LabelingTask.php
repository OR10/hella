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

    const INSTRUCTION_VEHICLE = 'vehicle';
    const INSTRUCTION_PERSON = 'person';
    const INSTRUCTION_CYCLIST = 'cyclist';
    const INSTRUCTION_IGNORE = 'ignore';

    const STATUS_PREPROCESSING = 'preprocessing';
    const STATUS_WAITING = 'waiting';
    const STATUS_LABELED = 'labeled';

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
     * @var int
     * @CouchDB\Field(type="integer")
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
     * @var string
     * @CouchDB\Field(type="string")
     * @Serializer\Groups({"statistics"})
     */
    private $status = 'preprocessing';

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
     * @var int|null
     * @CouchDB\Field(type="mixed")
     */
    private $assignedUser = null;

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
     */
    private $metaData = array();

    /**
     * @param Video   $video
     * @param Project $project
     * @param array   $frameNumberMapping
     * @param string  $taskType
     * @param string  $drawingTool
     * @param array   $predefinedClasses
     * @param array   $requiredImageTypes
     *
     * @return LabelingTask
     */
    public static function create(
        Video $video,
        Project $project,
        array $frameNumberMapping,
        $taskType,
        $drawingTool = null,
        $predefinedClasses = array(),
        array $requiredImageTypes = array()
    ) {
        return new static(
            $video,
            $project,
            $frameNumberMapping,
            $taskType,
            $drawingTool,
            $predefinedClasses,
            $requiredImageTypes
        );
    }

    /**
     * @param Video   $video
     * @param Project $project
     * @param array   $frameNumberMapping
     * @param string  $taskType
     * @param string  $drawingTool
     * @param array   $predefinedClasses
     * @param array   $requiredImageTypes
     */
    public function __construct(
        Video $video,
        Project $project,
        array $frameNumberMapping,
        $taskType,
        $drawingTool = null,
        $predefinedClasses = array(),
        array $requiredImageTypes = array()
    ) {
        $this->videoId            = $video->getId();
        $this->projectId          = $project->getId();
        $this->frameNumberMapping = $frameNumberMapping;
        $this->taskType           = $taskType;
        $this->drawingTool        = $drawingTool;
        $this->predefinedClasses  = $predefinedClasses;
        $this->requiredImageTypes = $requiredImageTypes;
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
     * @param string $status
     *
     * @return $this
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return string
     */
    public function getStatus()
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
        $this->setStatus(self::STATUS_WAITING);

        return $this;
    }

    /**
     * @return null|int
     */
    public function getAssignedUserId()
    {
        return $this->assignedUser;
    }

    /**
     * @param $userId
     *
     * @return LabelingTask
     */
    public function setAssignedUser($userId)
    {
        $this->assignedUser = $userId;

        return $this;
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
}
