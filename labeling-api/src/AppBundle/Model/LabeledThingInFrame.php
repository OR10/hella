<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class LabeledThingInFrame
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $frameNo;

    /** @CouchDB\Field(type="mixed") */
    private $classes;

    /** @CouchDB\Field(type="mixed") */
    private $shapes;

    /** @CouchDB\Field(type="integer") */
    private $labeledThingId;

    /**
     * @return mixed
     */
    public function getLabeledThingId()
    {
        return $this->labeledThingId;
    }
}