<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class LabeledFrame
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $frameNo;

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