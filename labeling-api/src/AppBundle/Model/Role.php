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
     * @var string[]
     *
     * @CouchDB\Field(type="mixed")
     */
    private $permissions;

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $label;

    /**
     * Role constructor.
     *
     * @param string   $id
     * @param string   $projectId
     * @param string   $label
     * @param string[] $permissions
     */
    public function __construct(string $id, string $projectId, string $label, array $permissions = [])
    {
        $this->id          = $id;
        $this->projectId   = $projectId;
        $this->permissions = $permissions;
        $this->label       = $label;
    }

    /**
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @return string[]
     */
    public function getPermissions()
    {
        return $this->permissions;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }
}
