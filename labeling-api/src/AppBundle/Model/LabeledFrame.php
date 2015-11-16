<?php

namespace AppBundle\Model;

use AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledFrame
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
     * @CouchDB\Field(type="integer")
     */
    private $frameNumber;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labelingTaskId;

    /**
     * @CouchDB\Field(type="boolean")
     */
    private $incomplete = true;

    public function __construct(Model\LabelingTask $task)
    {
        $this->labelingTaskId = $task->getId();
    }

    /**
     * @return mixed
     */
    public function getLabelingTaskId()
    {
        return $this->labelingTaskId;
    }

    /**
     * @param int $frameNumber
     */
    public function setFrameNumber($frameNumber)
    {
        $this->frameNumber = $frameNumber;
    }

    /**
     * @param mixed $classes
     */
    public function setClasses($classes)
    {
        $this->classes = $classes;
    }

    /**
     * @param string $labelingTaskId
     */
    public function setLabelingTaskId($labelingTaskId)
    {
        $this->labelingTaskId = $labelingTaskId;
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
     * @param mixed $incomplete
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = $incomplete;
    }
}
