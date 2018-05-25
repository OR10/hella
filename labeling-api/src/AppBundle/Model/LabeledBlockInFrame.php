<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledBlockInFrame extends Base
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
     * @CouchDB\Field(type="string")
     */
    private $taskId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @CouchDB\EmbedOne(targetDocument="AppBundle\Model\FrameIndexRange")
     */
    private $frameRange;

    /**
     * @CouchDB\Field(type="string")
     */
    private $frameIndex;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $place;

    /**
     * @CouchDB\Field(type="string")
     */
    private $createdByUserId;

    /**
     * @CouchDB\Field(type="boolean")
     */
    private $incomplete = true;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $notExtrClassesGroups;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lastModifiedByUserId;

    /**
     * @param LabeledThing $labeledThing
     * @param int $frameIndex
     * @param array $classes
     * @param array $shapes
     *
     * @return static
     */
    public static function create(
        LabelingTask $task,
        $startIndex,
        $endIndex
    ) {
        return new static($task, $startIndex, $endIndex);
    }

    /**
     * LabeledBlockInFrame constructor.
     * @param LabelingTask $task
     * @param $frameIndex
     */
    public function __construct(
        LabelingTask $task,
        $startIndex,
        $endIndex
    ) {

        $this->taskId        = $task->getId();
        $this->projectId     = $task->getProjectId();

        $this->frameRange      = new FrameIndexRange(
            $startIndex, $endIndex
        );

    }

    /**
     * @return string
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * @return mixed
     */
    public function getNotExtrClasses()
    {
        return $this->notExtrClassesGroups;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
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
     * @return array
     */
    public function getClasses()
    {
        if ($this->classes === null) {
            return [];
        }

        return $this->classes;
    }

    /**
     * @param array $classes
     */
    public function setClasses(array $classes)
    {
        $this->classes = $classes;
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
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @param mixed $projectId
     */
    public function setProjectId($projectId)
    {
        $this->projectId = $projectId;
    }

    /**
     * @param $place
     */
    public function setPlace($place)
    {
        $this->place = $place;
    }

    /**
     * @return mixed
     */
    public function getPlace()
    {
        return $this->place;
    }

    /**
     * @return mixed
     */
    public function getCreatedByUserId()
    {
        return $this->createdByUserId;
    }

    /**
     * @return mixed
     */
    public function getLastModifiedByUserId()
    {
        return $this->lastModifiedByUserId;
    }

    /**
     * @param mixed $lastModifiedByUserId
     */
    public function setLastModifiedByUserId($lastModifiedByUserId)
    {
        $this->lastModifiedByUserId = $lastModifiedByUserId;
    }

    /**
     * @param $userId
     */
    public function setUser($userId)
    {
        $this->createdByUserId = $userId;
    }

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->createdByUserId;
    }

    /**
     * @param $index
     */
    public function setFrameIndex($index)
    {
        $this->frameIndex = $index;
    }

    /**
     * @return int
     */
    public function getFrameIndex()
    {
        return $this->frameIndex;
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
     * @return mixed
     */
    public function getIncomplete()
    {
        return $this->incomplete;
    }

    /**
     * @param $incomplete
     * @return $this
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = (bool) $incomplete;

        return $this;
    }
}
