<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/** @CouchDB\Document */
class LabelingTask
{
    /** @CouchDB\Id */
    private $id;

    /** @CouchDB\Field(type="integer") */
    private $userId;

    /** @CouchDB\Field(type="integer") */
    private $videoId;

    public function getVideoId()
    {
        return $this->videoId;
    }
}