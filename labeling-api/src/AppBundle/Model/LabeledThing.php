<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class LabeledThing
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $frameRange;

    /** @CouchDB\Field(type="mixed") */
    private $classes;

    /** @CouchDB\Field(type="integer") */
    private $labelingTaskId;

    /**
     * @return mixed
     */
    public function getLabelingTaskId()
    {
        return $this->labelingTaskId;
    }
}