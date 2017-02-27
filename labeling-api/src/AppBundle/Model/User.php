<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * @CouchDB\Document
 */
class User extends BaseUser
{
    const ROLE_ADMIN = 'ROLE_ADMIN';
    const ROLE_LABEL_COORDINATOR = 'ROLE_LABEL_COORDINATOR';
    const ROLE_LABELER = 'ROLE_LABELER';
    const ROLE_CLIENT = 'ROLE_CLIENT';
    const ROLE_OBSERVER = 'ROLE_OBSERVER';

    /**
     * STRATEGY ASSIGNED IS ONLY USED TO CONVERT THE EXISTING MYSQL USER!!!
     *
     * @CouchDB\Id
     */
    protected $id;

    /**
     * @CouchDB\Field(type="string")
     */
    protected $token = '';

    /**
     * @CouchDB\Field(type="mixed")
     */
    protected $lockHistory = [];

    /**
     * @CouchDB\Field(type="mixed")
     */
    protected $settings = [];

    /**
     * @var ProjectRoles[]
     *
     * @CouchDB\EmbedMany(targetDocument="ProjectRoles")
     */
    protected $projectRoles = [];

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @param array $roles
     *
     * @return bool
     */
    public function hasOneRoleOf(array $roles)
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return mixed
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * @param mixed $token
     */
    public function setToken($token)
    {
        $this->token = $token;
    }

    /**
     * @param User      $user
     * @param \DateTime $dateTime
     */
    public function addLockHistoryEntry(User $user, \DateTime $dateTime)
    {
        $this->lockHistory[] = [
            'userId'   => $user->getId(),
            'dateTime' => $dateTime->getTimestamp(),
        ];
    }

    /**
     * @param array $settings
     */
    public function setSettings(array $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @return mixed
     */
    public function getSettings()
    {
        return $this->settings;
    }

    /**
     * @param string $projectId
     * @param Role   $role
     */
    public function assignRole(string $projectId, Role $role)
    {
        $roles = $this->getOrCreateProjectRolesForProjectId($projectId);
        $roles->assignRole($role);
    }

    /**
     * @param string $projectId
     * @param array  $roles
     */
    public function setRolesForProject(string $projectId, array $roles)
    {
        $projectRoles = $this->getOrCreateProjectRolesForProjectId($projectId);
        $projectRoles->setRoles($roles);
    }

    /**
     * @param string $projectId
     *
     * @return Role[]
     */
    public function getRolesForProject(string $projectId)
    {
        $roles = $this->getProjectRolesForProjectId($projectId);
        if ($roles === null) {
            return [];
        }

        return $roles->getRoles();
    }

    /**
     * @return string[]
     */
    public function getProjectRoles()
    {
        return $this->projectRoles ?? [];
    }

    /**
     * @param string $projectId
     */
    public function clearRemovedRoles(string $projectId)
    {
        $projectRoles = $this->getOrCreateProjectRolesForProjectId($projectId);
        $projectRoles->clearRemovedRoles();
    }

    /**
     * @param string $projectId
     *
     * @return ProjectRoles|null
     */
    public function getProjectRolesForProjectId(string $projectId)
    {
        foreach ($this->projectRoles as $projectRoles) {
            if ($projectRoles->getProjectId() == $projectId) {
                return $projectRoles;
            }
        }

        return null;
    }

    /**
     * @param string $projectId
     *
     * @return ProjectRoles
     */
    public function getOrCreateProjectRolesForProjectId(string $projectId)
    {
        if ($this->projectRoles === null) {
            $this->projectRoles = [];
        }

        $roles = $this->getProjectRolesForProjectId($projectId);

        if ($roles === null) {
            $roles                = new ProjectRoles($projectId);
            $this->projectRoles[] = $roles;
        }

        return $roles;
    }
}
