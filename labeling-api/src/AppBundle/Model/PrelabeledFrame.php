<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class PrelabeledFrame
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $frameNo;

    /** @CouchDB\Field(type="mixed") */
    private $classes;

    /** @CouchDB\Field(type="string") */
    private $videoId;

    public function getVideoId()
    {
        return $this->videoId;
    }

    /**
     * @param Video $video
     */
    public function setVideo(Video $video)
    {
        $this->videoId = $video->getId();
    }

    /**
     * @param int $frameNo
     */
    public function setFrameNo($frameNo)
    {
        $this->frameNo = $frameNo;
    }

    /**
     * @param mixed $classes
     */
    public function setClasses($classes)
    {
        $this->classes = $classes;
    }

    /**
     * @param string $videoId
     */
    public function setVideoId($videoId)
    {
        $this->videoId = $videoId;
    }


}