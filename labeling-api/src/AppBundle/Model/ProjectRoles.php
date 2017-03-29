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
     * @var string[]
     * @CouchDB\Field(type="mixed")
     */
    protected $roleIds = [];

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
        $this->removedRoles = new ArrayCollection();
    }

    /**
     * @param Role $role
     */
    public function assignRole(Role $role)
    {
        if (!in_array($role->getId(), $this->roleIds)) {
            $this->roleIds[] = $role->getId();
        }
    }

    /**
     * @param Role[] $roles
     */
    public function setRoles(array $roles)
    {
        $this->roleIds = [];
        foreach ($roles as $role) {
            if (!in_array($role->getId(), $this->roleIds)) {
                $this->roleIds[] = $role->getId();
            }
        }
    }

    /**
     * @return string[]
     */
    public function getRoleIds()
    {
        return $this->roleIds;
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
        if (($removedRoleIndex = array_search($role->getId(), $this->roleIds)) !== false) {
            unset($this->roleIds[$removedRoleIndex]);
        }

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
