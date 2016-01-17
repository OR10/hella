<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledThing
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
     * @CouchDB\EmbedOne(targetDocument="AppBundle\Model\FrameRange")
     */
    private $frameRange;

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
     * @CouchDB\Field(type="string")
     */
    private $lineColor;

    /**
     * @param LabelingTask $task
     * @param $lineColor
     *
     * @return LabeledThing
     */
    public static function create(LabelingTask $task, $lineColor = 'red')
    {
        return new static($task, $lineColor);
    }

    /**
     * @param LabelingTask $task
     * @param $lineColor
     */
    public function __construct(LabelingTask $task, $lineColor = 'red')
    {
        $this->taskId     = $task->getId();
        $this->frameRange = $task->getFrameRange();
        $this->lineColor  = $lineColor;
    }

    /**
     * @return string
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * @return FrameRange
     */
    public function getFrameRange()
    {
        return $this->frameRange ? clone $this->frameRange : null;
    }

    /**
     * @param FrameRange $frameRange
     *
     * @return LabeledThing
     */
    public function setFrameRange(FrameRange $frameRange)
    {
        $this->frameRange = $frameRange;

        return $this;
    }

    /**
     * @return string[]
     */
    public function getClasses()
    {
        return $this->classes;
    }

    /**
     * @param string[] $classes
     *
     * @return LabeledThing
     */
    public function setClasses(array $classes)
    {
        $this->classes = $classes;

        return $this;
    }

    /**
     * @param string $class
     *
     * @return boolean
     */
    public function hasClass($class)
    {
        return in_array($class, $this->classes);
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getIncomplete()
    {
        return $this->incomplete;
    }

    /**
     * @param mixed $incomplete
     *
     * @return LabeledThing
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = $incomplete;

        return $this;
    }

    /**
     * @param mixed $id
     *
     * @return LabeledThing
     *
     * @throws \LogicException if the id was already set.
     */
    public function setId($id)
    {
        if ($this->id !== null) {
            throw new \LogicException("Trying to set an already assigned id from '{$this->id}' to '{$id}'");
        }

        $this->id = $id;

        return $this;
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
    public function getLineColor()
    {
        return $this->lineColor;
    }
}
