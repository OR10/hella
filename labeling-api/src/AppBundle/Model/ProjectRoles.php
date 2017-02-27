<?php

namespace AppBundle\Model;

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
    protected $roles = [];

    /**
     * @var Role[]
     *
     * @CouchDB\EmbedMany(targetDocument="Role")
     */
    protected $removedRoles = [];

    /**
     * ProjectRoles constructor.
     *
     * @param string $projectId
     */
    public function __construct(string $projectId)
    {
        $this->projectId = $projectId;
    }

    /**
     * @param Role $role
     */
    public function assignRole(Role $role)
    {
        $existingRole = array_filter(
            $this->roles,
            function (Role $currentRole) use ($role) {
                return $role->getId() == $currentRole->getId();
            }
        );

        if (count($existingRole) === 0) {
            $this->roles[] = $role;
        }
    }

    /**
     * @param Role[] $roles
     */
    public function setRoles(array $roles)
    {
        $this->roles = $roles;
    }

    /**
     * @return Role[]
     */
    public function getRoles()
    {
        return $this->roles;
    }

    /**
     * @return mixed
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return void
     */
    public function clearRemovedRoles()
    {
        $this->removedRoles = [];
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
        return $this->removedRoles;
    }
}
