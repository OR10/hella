<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AppBundle\Model as AppBundleModel;

/**
 * @CouchDB\Document
 */
class LabeledThingGroup extends AppBundleModel\Base
{
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
    private $projectId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $taskId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $identifierName;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lineColor;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $groupIds = [];

    /**
     * @CouchDB\Field(type="string")
     */
    private $originalId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $createdByUserId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lastModifiedByUserId;

    public function __construct(
        AppBundleModel\LabelingTask $task,
        $lineColor,
        $identifierName = null,
        $groupIds = [],
        $createdByUserId = null
    ) {
        $this->projectId       = $task->getProjectId();
        $this->taskId          = $task->getId();
        $this->identifierName  = $identifierName;
        $this->groupIds        = $groupIds;
        $this->lineColor       = $lineColor;
        $this->createdByUserId = $createdByUserId;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $taskId
     */
    public function setTaskId($taskId)
    {
        $this->taskId = $taskId;
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
    public function getIdentifierName()
    {
        return $this->identifierName;
    }

    /**
     * @return mixed
     */
    public function getOriginalId()
    {
        return $this->originalId;
    }

    /**
     * @param mixed $originalId
     */
    public function setOriginalId($originalId)
    {
        $this->originalId = $originalId;
    }

    /**
     * @return mixed
     */
    public function getTaskId()
    {
        return $this->taskId;
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
     * @param mixed $identifierName
     */
    public function setIdentifierName($identifierName)
    {
        $this->identifierName = $identifierName;
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
