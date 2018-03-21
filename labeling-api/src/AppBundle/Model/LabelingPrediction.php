<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabelingPrediction extends Base
{
    const PREDICTION_ON = true;
    const PREDICTION_OFF = false;

    /**
     * @CouchDB\Id
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
     * @CouchDB\Field(type="boolean")
     */
    private $status;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lastModifiedByUserId;

    /**
     * @param LabelingTask $task
     * @param Project $project
     * @param null $createdByUserId
     * @return static
     */
    public static function create(LabelingTask $task)
    {
        return new static($task);
    }

    /**
     * LabelingPrediction constructor.
     * @param LabelingTask $task
     */
    public function __construct(LabelingTask $task)
    {
        $this->taskId     = $task->getId();
        $this->projectId  = $task->getProjectId();
        $this->status     = self::PREDICTION_ON;
    }

    /**
     * @return string
     */
    public function getTaskId()
    {
        return $this->taskId;
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
