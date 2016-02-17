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
    private $descriptionTitle;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $descriptionText;

    /**
     * @var FrameRange
     * @CouchDB\EmbedOne(targetDocument="AppBundle\Model\FrameRange")
     * @Serializer\Groups({"statistics"})
     */
    private $frameRange;

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
     * @var int|null
     * @CouchDB\Field(type="mixed")
     */
    private $assignedUser = null;

    /**
     * @param Video      $video
     * @param FrameRange $frameRange
     * @param string     $taskType
     * @param string     $drawingTool
     * @param array      $predefinedClasses
     * @param array      $requiredImageTypes
     *
     * @return LabelingTask
     */
    public static function create(
        Video $video,
        FrameRange $frameRange,
        $taskType,
        $drawingTool = null,
        $predefinedClasses = array(),
        array $requiredImageTypes = array()
    ) {
        return new static($video, $frameRange, $taskType, $drawingTool, $predefinedClasses, $requiredImageTypes);
    }

    /**
     * @param Video      $video
     * @param FrameRange $frameRange
     * @param string     $taskType
     * @param string     $drawingTool
     * @param array      $predefinedClasses
     * @param array      $requiredImageTypes
     */
    public function __construct(
        Video $video,
        FrameRange $frameRange,
        $taskType,
        $drawingTool = null,
        $predefinedClasses = array(),
        array $requiredImageTypes = array()
    ) {
        $this->videoId            = $video->getId();
        $this->frameRange         = clone $frameRange;
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
     * @return FrameRange
     */
    public function getFrameRange()
    {
        return $this->frameRange ? clone $this->frameRange : null;
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
     * @return LabelingTask
     */
    public function setAssignedUser($userId)
    {
        $this->assignedUser = $userId;

        return $this;
    }
}
