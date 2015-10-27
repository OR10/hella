<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledThing
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $frameRange;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labelingTaskId;

    /**
     * @param $labelingTaskId
     */
    function __construct($labelingTaskId)
    {
        $this->labelingTaskId = $labelingTaskId;
    }

    /**
     * @return string
     */
    public function getLabelingTaskId()
    {
        return $this->labelingTaskId;
    }

    /**
     * @param mixed $frameRange
     */
    public function setFrameRange($frameRange)
    {
        $this->frameRange = $frameRange;
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
    public function getId()
    {
        return $this->id;
    }

}
