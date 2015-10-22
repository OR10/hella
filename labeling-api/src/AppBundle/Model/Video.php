<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class Video
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Field(type="string")
     */
    private $name;

    /**
     * @var Video\MetaData
     * @CouchDB\Field(type="mixed")
     */
    private $metaData;

    /**
     * @param string $name The name of the video.
     */
    public function __construct($name)
    {
        $this->name = (string) $name;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return Video
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @param Video\MetaData
     * @return Video
     */
    public function setMetaData(Video\MetaData $metaData)
    {
        $this->metaData = $metaData;
        return $this;
    }

    /**
     * @return Video\MetaData
     */
    public function getMetaData()
    {
        return $this->metaData;
    }
}
