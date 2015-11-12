<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabelingTask
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $userId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $videoId;

    /**
     * @CouchDB\EmbedOne(targetDocument="AppBundle\Model\FrameRange")
     */
    private $frameRange;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $requiredImageTypes;

    /**
     * @param Video      $video
     * @param FrameRange $frameRange
     * @param array      $requiredImageTypes
     */
    public function __construct(Video $video, FrameRange $frameRange, array $requiredImageTypes = array())
    {
        $this->videoId            = $video->getId();
        $this->frameRange         = clone $frameRange;
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
}
