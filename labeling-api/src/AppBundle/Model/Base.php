<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

abstract class Base
{
    /**
     * @CouchDB\Field(type="datetime")
     */
    protected $createdAt;

    /**
     * @CouchDB\Field(type="datetime")
     */
    protected $lastModifiedAt;

    /**
     * @CouchDB\Field(type="mixed")
     */
    protected $notExtrClassesGroups;

    /**
     * @param mixed $createdAt
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    /**
     * @param mixed $lastModifiedAt
     */
    public function setLastModifiedAt($lastModifiedAt)
    {
        $this->lastModifiedAt = $lastModifiedAt;
    }

    /**
     * @return null|\DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return mixed
     */
    public function getLastModifiedAt()
    {
        return $this->lastModifiedAt;
    }

    /**
     * @return mixed
     */
    public function getNotExtrClasses()
    {
        return $this->notExtrClassesGroups;
    }

    /**
     * @param array $classGroup
     * @return array
     */
    public function setNotExtrClasses(array $classGroup)
    {
        return $this->notExtrClassesGroups[] = $classGroup;
    }
}