<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class LabeledFrame
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $frameNumber;

    /** @CouchDB\Field(type="mixed") */
    private $classes;

    /** @CouchDB\Field(type="string") */
    private $labelingTaskId;

    /**
     * @return mixed
     */
    public function getLabelingTaskId()
    {
        return $this->labelingTaskId;
    }

    /**
     * @param int $frameNumber
     */
    public function setFrameNumber($frameNumber)
    {
        $this->frameNumber = $frameNumber;
    }

    /**
     * @param mixed $classes
     */
    public function setClasses($classes)
    {
        $this->classes = $classes;
    }

    /**
     * @param string $labelingTaskId
     */
    public function setLabelingTaskId($labelingTaskId)
    {
        $this->labelingTaskId = $labelingTaskId;
    }

}
