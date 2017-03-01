<?php

namespace AppBundle\Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class ProjectRoles
{

    /**
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    private $id;

    /**
     * @CouchDB\Field(type="string")
     */
    protected $projectId = "";

    /**
     * @var Role[]
     *
     * @CouchDB\EmbedMany(targetDocument="Role")
     */
    protected $roles;

    /**
     * @var Role[]
     *
     * @CouchDB\EmbedMany(targetDocument="Role")
     */
    protected $removedRoles;

    /**
     * ProjectRoles constructor.
     *
     * @param string $projectId
     */
    public function __construct(string $projectId)
    {
        $this->projectId    = $projectId;
        $this->roles        = new ArrayCollection();
        $this->removedRoles = new ArrayCollection();
    }

    /**
     * @param Role $role
     */
    public function assignRole(Role $role)
    {
        if ($this->roles[$role->getId()] === null) {
            $this->roles[$role->getId()] = $role;
        }
    }

    /**
     * @param Role[] $roles
     */
    public function setRoles(array $roles)
    {
        foreach ($roles as $role) {
            $this->roles[$role->getId()] = $role;
        }
    }

    /**
     * @return Role[]
     */
    public function getRoles()
    {
        return array_values($this->roles->toArray());
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
    public function getId()
    {
        return $this->id;
    }

    public function clearRemovedRoles()
    {
        $this->removedRoles = new ArrayCollection();
    }

    /**
     * @param Role $role
     */
    public function addRemovedRole(Role $role)
    {
        $this->removedRoles[] = $role;
    }

    /**
     * @return Role[]
     */
    public function getRemovedRoles()
    {
        return $this->removedRoles->toArray();
    }
}
