<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AppBundle\Model as AppBundleModel;

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
    private $labeledThingGroupId;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $frameIndex;

    public function __construct($labeledThingGroupId, $frameIndex, $classes = [])
    {
        $this->frameIndex          = $frameIndex;
        $this->classes             = $classes;
        $this->labeledThingGroupId = $labeledThingGroupId;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }
}
