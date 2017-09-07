<?php

namespace AppBundle\Model;

use crosscan\Std;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class Role extends Base
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
     * @var boolean
     *
     * @CouchDB\Field(type="boolean")
     */
    private $systemRole;

    /**
     * Role constructor.
     *
     * @param string   $id
     * @param string   $projectId
     * @param string   $label
     * @param string[] $permissions
     * @param bool     $systemRole
     */
    public function __construct(
        string $id,
        string $projectId,
        string $label,
        array $permissions = [],
        bool $systemRole = false
    ) {
        $this->id          = $id;
        $this->projectId   = $projectId;
        $this->permissions = $permissions;
        $this->label       = $label;
        $this->systemRole  = $systemRole;
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

    /**
     * @param string $label
     */
    public function setLabel($label)
    {
        $this->label = $label;
    }

    /**
     * @param string[] $permissions
     */
    public function setPermissions($permissions)
    {
        $this->permissions = $permissions;
    }

    /**
     * @return boolean
     */
    public function isSystemRole()
    {
        return $this->systemRole;
    }
}
