<?php

namespace AppBundle\Model;

use crosscan\Std;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class Role
{

    /**
     * @var string
     *
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    private $id;

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $name;

    /**
     * @var string[]
     *
     * @CouchDB\Field(type="mixed")
     */
    private $permissions;

    /**
     * Role constructor.
     *
     * @param string   $id
     * @param string   $projectId
     * @param string   $name
     * @param string[] $permissions
     */
    public function __construct(string $id, string $projectId, string $name, array $permissions = [])
    {
        $this->id          = $id;
        $this->projectId   = $projectId;
        $this->name        = $name;
        $this->permissions = $permissions;
    }

    /**
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string[]
     */
    public function getPermissions()
    {
        return $this->permissions;
    }
}
