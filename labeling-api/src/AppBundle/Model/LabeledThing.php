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
     * @CouchDB\EmbedOne(targetDocument="AppBundle\Model\FrameIndexRange")
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
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @CouchDB\Field(type="boolean")
     */
    private $incomplete = true;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lineColor;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $groupIds;

    /**
     * @param LabelingTask $task
     * @param $lineColor
     *
     * @return LabeledThing
     */
    public static function create(LabelingTask $task, $lineColor = 1)
    {
        return new static($task, $lineColor);
    }

    /**
     * @param LabelingTask $task
     * @param $lineColor
     */
    public function __construct(LabelingTask $task, $lineColor = 1)
    {
        $this->taskId     = $task->getId();
        $this->projectId  = $task->getProjectId();
        $this->frameRange = new FrameIndexRange(
            min(array_keys($task->getFrameNumberMapping())),
            max(array_keys($task->getFrameNumberMapping()))
        );
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
     * @return FrameIndexRange
     */
    public function getFrameRange()
    {
        return $this->frameRange ? clone $this->frameRange : null;
    }

    /**
     * @param FrameIndexRange $frameRange
     *
     * @return LabeledThing
     */
    public function setFrameRange(FrameIndexRange $frameRange)
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

    /**
     * @return mixed
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @param mixed $groupIds
     */
    public function setGroupIds($groupIds)
    {
        $this->groupIds = $groupIds;
    }

    /**
     * @return array
     */
    public function getGroupIds()
    {
        if ($this->groupIds === null) {
            return [];
        }

        return $this->groupIds;
    }

    /**
     * @param mixed $projectId
     */
    public function setProjectId($projectId)
    {
        $this->projectId = $projectId;
    }
}
