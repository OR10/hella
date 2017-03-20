<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AppBundle\Model as AppBundleModel;

/**
 * @CouchDB\Document
 */
class LabeledThingGroup
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
    private $taskId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $groupType;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lineColor;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $groupIds = [];

    public function __construct(AppBundleModel\LabelingTask $task, $lineColor, $groupType = null, $groupIds = [])
    {
        $this->taskId    = $task->getId();
        $this->groupType = $groupType;
        $this->groupIds  = $groupIds;
        $this->lineColor = $lineColor;
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
}
