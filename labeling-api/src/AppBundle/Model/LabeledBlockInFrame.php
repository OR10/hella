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
    private $labelBlockGroupIds;

    /**
     * @CouchDB\Field(type="string")
     */
    private $status;

    /**
     * @CouchDB\Field(type="string")
     */
    private $createdByUserId;

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
        LabeledBlock $labeledBlock,
        $frameIndex
    ) {
        return new static($labeledBlock, $frameIndex);
    }

    /**
     * LabeledBlockInFrame constructor.
     * @param LabeledBlock $labeledThing
     * @param $frameIndex
     * @param array $classes
     * @param array $shapes
     */
    public function __construct(
        LabeledBlock $labeledBlock,
        LabelingTask $task,
        $frameIndex
    ) {
        $labeledBlock->getFrameRange()->throwIfFrameIndexIsNotCovered($frameIndex);

        $this->taskId         = $labeledBlock->getTaskId();
        $this->projectId     = $labeledBlock->getProjectId();
        $this->frameIndex    = (int) $frameIndex;
        $this->frameRange      = new FrameIndexRange(
            min(array_keys($task->getFrameNumberMapping())),
            max(array_keys($task->getFrameNumberMapping()))
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
     * @return mixed
     */
    public function getCreatedByUserId()
    {
        return $this->createdByUserId;
    }

    /**
     * @param mixed $groupIds
     */
    public function setLabeledGroupIds($groupIds)
    {
        $this->labelBlockGroupIds = $groupIds;
    }

    /**
     * @param $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return array
     */
    public function getLabeledGroupIds()
    {
        if ($this->labelBlockGroupIds === null) {
            return [];
        }

        return $this->labelBlockGroupIds;
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
}
