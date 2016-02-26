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
     * @var null|array
     */
    private $ghostClasses = null;

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
     *
     * @return LabeledFrame
     */
    public static function create(LabelingTask $task, $frameNumber)
    {
        return new static($task, $frameNumber);
    }

    /**
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
     * @param string[] $classes
     *
     * @return LabeledFrame
     */
    public function setClasses($classes)
    {
        $this->classes = $classes;

        return $this;
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
     *
     * @return LabeledFrame
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = (bool) $incomplete;

        return $this;
    }

    /**
     * @param string $id
     *
     * @return LabeledFrame
     *
     * @throw \LogicException if the id was already set.
     */
    public function setId($id)
    {
        if ($this->id !== null) {
            throw new \LogicException("Trying to set an already assigned id from '{$this->id}' to '{$id}'");
        }
        $this->id = (string) $id;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $frameNumber
     *
     * @return LabeledFrame
     */
    public function copyToFrameNumber($frameNumber)
    {
        $reflectionClass    = new \ReflectionClass(self::class);
        $copy               = $reflectionClass->newInstanceWithoutConstructor();
        $copy->frameNumber  = $frameNumber;
        $copy->classes      = [];
        if (!empty($this->classes)) {
            $copy->ghostClasses = $this->classes;
        }
        $copy->incomplete   = $this->incomplete;
        $copy->taskId       = $this->taskId;

        return $copy;
    }

    /**
     * @return mixed
     */
    public function getGhostClasses()
    {
        return $this->ghostClasses;
    }

    /**
     * @param mixed $ghostClasses
     */
    public function setGhostClasses($ghostClasses)
    {
        $this->ghostClasses = $ghostClasses;
    }
}
