<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class LabeledThingInFrame
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
     * @CouchDB\Field(type="mixed")
     */
    private $shapes;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labeledThingId;

    /**
     * @param LabeledThing $labeledThing
     */
    public function __construct(LabeledThing $labeledThing)
    {
        $this->labeledThingId = $labeledThing->getId();
    }

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
    public function getRev()
    {
        return $this->rev;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }
}
