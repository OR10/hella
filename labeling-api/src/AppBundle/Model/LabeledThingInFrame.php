<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class LabeledThingInFrame
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $frameNumber;

    /** @CouchDB\Field(type="mixed") */
    private $classes;

    /** @CouchDB\Field(type="mixed") */
    private $shapes;

    /** @CouchDB\Field(type="string") */
    private $labeledThingId;

    /**
     * @return string
     */
    public function getLabeledThingId()
    {
        return $this->labeledThingId;
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
     * @param mixed $shapes
     */
    public function setShapes($shapes)
    {
        $this->shapes = $shapes;
    }

    /**
     * @param string $labeledThingId
     */
    public function setLabeledThingId($labeledThingId)
    {
        $this->labeledThingId = $labeledThingId;
    }

}
