<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledFrame
{
    /**
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    private $id;

    /**
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $frameNumber;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes = [];

    /**
     * @CouchDB\Field(type="string")
     */
    private $taskId;

    /**
     * @CouchDB\Field(type="boolean")
     */
    private $incomplete = true;

    /**
     * @param LabelingTask $task
     * @param int          $frameNumber
     */
    public function __construct(LabelingTask $task, $frameNumber)
    {
        if (!$task->getFrameRange()->coversFrameNumber($frameNumber)) {
            throw new \RangeException("Invalid frameNumber '{$frameNumber}'");
        }

        $this->taskId      = $task->getId();
        $this->frameNumber = (int) $frameNumber;
    }

    /**
     * @return mixed
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * @param mixed $classes
     */
    public function setClasses($classes)
    {
        $this->classes = $classes;
    }

    /**
     * @return mixed
     */
    public function getClasses()
    {
        return $this->classes;
    }

    /**
     * @return mixed
     */
    public function getRev()
    {
        return $this->rev;
    }

    /**
     * @return mixed
     */
    public function getFrameNumber()
    {
        return $this->frameNumber;
    }

    /**
     * @return mixed
     */
    public function getIncomplete()
    {
        return $this->incomplete;
    }

    /**
     * @param boolean $incomplete
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = (bool) $incomplete;
    }

    /**
     * @param mixed $id
     *
     * @throw \LogicException if the id was already set.
     */
    public function setId($id)
    {
        if ($this->id !== null) {
            throw new \LogicException("Trying to set an already assigned id from '{$this->id}' to '{$id}'");
        }
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }
}
