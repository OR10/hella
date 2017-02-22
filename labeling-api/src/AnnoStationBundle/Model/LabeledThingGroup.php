<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

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
    private $groupType;

    /**
     * @CouchDB\Field(type="string")
     */
    private $lineColor;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $groupIds = [];

    public function __construct($lineColor, $groupType = null, $groupIds = [])
    {
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
}
