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
     * @var boolean
     * @CouchDB\Field(type="boolean")
     */
    private $enabled = false;

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
     */
    public function setUserId($userId)
    {
        $this->userId = $userId;
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
     */
    public function setDescriptionText($descriptionText)
    {
        $this->descriptionText = $descriptionText;
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
     */
    public function setDescriptionTitle($descriptionTitle)
    {
        $this->descriptionTitle = $descriptionTitle;
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
     * @param boolean $enabled
     */
    public function setEnabled($enabled = true)
    {
        $this->enabled = (bool) $enabled;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param Video $video
     */
    public function setEnabledIfAllImagesAreConverted(Video $video)
    {
        foreach ($this->getRequiredImageTypes() as $requiredImageType) {
            if (!$video->isImageTypeConverted($requiredImageType)) {
                return;
            }
        }
        $this->setEnabled();
    }
}
