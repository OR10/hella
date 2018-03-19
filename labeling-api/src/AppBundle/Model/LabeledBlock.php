<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledBlock extends Base
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
     * @CouchDB\Field(type="string")
     */
    private $taskId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $status;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $frameIndex;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $createdByUserId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lastModifiedByUserId;

    /**
     * @param LabelingTask $task
     * @param int          $lineColor
     * @param null         $createdByUserId
     *
     * @return LabeledThing
     */
    public static function create(LabelingTask $task, $createdByUserId = null)
    {
        return new static($task, $createdByUserId);
    }

    /**
     * @param LabelingTask $task
     * @param int          $lineColor
     * @param null         $createdByUserId
     */
    public function __construct(LabelingTask $task, $createdByUserId = null)
    {
        $this->taskId          = $task->getId();
        $this->projectId       = $task->getProjectId();
        $this->frameRange      = new FrameIndexRange(
            min(array_keys($task->getFrameNumberMapping())),
            max(array_keys($task->getFrameNumberMapping()))
        );
        $this->createdByUserId = $createdByUserId;
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
     * @param $status
     * @return $this
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param $index
     * @return $this
     */
    public function setFrameIndex($index)
    {
        $this->frameIndex = $index;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getFrameIndex()
    {
        return $this->frameIndex;
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
}
