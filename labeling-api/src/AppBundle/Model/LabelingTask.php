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
     * @CouchDB\Field(type="mixed")
     */
    private $frameRange;

    /**
     * @param FrameRange $frameRange
     */
    public function __construct(Video $video, FrameRange $frameRange)
    {
        $this->videoId    = $video->getId();
        $this->frameRange = clone $frameRange;
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
        return clone $this->frameRange;
    }
}
