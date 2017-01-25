<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class LabeledThingGroupInFrame
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
     * @CouchDB\Field(type="mixed")
     */
    private $classes;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $frameIndex;

    public function __construct($frameIndex, $classes = [])
    {
        $this->frameIndex = $frameIndex;
        $this->classes    = $classes;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }
}
