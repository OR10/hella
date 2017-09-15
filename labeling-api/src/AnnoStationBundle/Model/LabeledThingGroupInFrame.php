<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AppBundle\Model as AppBundleModel;
use AnnoStationBundle\Model;

/**
 * @CouchDB\Document
 */
class LabeledThingGroupInFrame extends AppBundleModel\Base
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
    private $labeledThingGroupId;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $frameIndex;

    public function __construct(AppBundleModel\LabelingTask $task, Model\LabeledThingGroup $labeledThingGroup, $frameIndex, $classes = [])
    {
        $this->projectId           = $task->getProjectId();
        $this->taskId              = $task->getId();
        $this->labeledThingGroupId = $labeledThingGroup->getId();
        $this->frameIndex          = $frameIndex;
        $this->classes             = $classes;
    }

    /**
     * @param null $frameIndex
     * @param bool $cloneIdAndRevision
     * @return object
     */
    public function copy($frameIndex = null, $cloneIdAndRevision = false)
    {
        $reflectionClass           = new \ReflectionClass(self::class);
        $copy                      = $reflectionClass->newInstanceWithoutConstructor();
        $copy->taskId              = $this->taskId;
        $copy->projectId           = $this->projectId;
        $copy->labeledThingGroupId = $this->labeledThingGroupId;
        $copy->classes             = $this->classes;
        $copy->createdAt           = $this->createdAt;
        $copy->lastModifiedAt      = $this->lastModifiedAt;

        if ($frameIndex === null) {
            $copy->frameIndex = $this->frameIndex;
        } else {
            $copy->frameIndex = (int) $frameIndex;
        }

        if ($cloneIdAndRevision === true) {
            $copy->id = $this->id;
            $copy->rev = $this->rev;
        }

        return $copy;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getFrameIndex()
    {
        return $this->frameIndex;
    }

    /**
     * @return mixed
     */
    public function getClasses()
    {
        return $this->classes;
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
    public function getLabeledThingGroupId()
    {
        return $this->labeledThingGroupId;
    }
}
