<?php

namespace AppBundle\Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * @CouchDB\Document
 */
class User extends BaseUser
{
    const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
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
    protected $projectRoles;

    /**
     * @CouchDB\Field(type="mixed")
     */
    protected $organisations = [];

    /**
     * @CouchDB\Field(type="string")
     */
    protected $couchDbPassword;

    /**
     * User constructor.
     */
    public function __construct()
    {
        $this->projectRoles = new ArrayCollection();
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
     * @param Role[] $roles
     */
    public function setRolesForProject(string $projectId, array $roles)
    {
        if (empty($roles)) {
            unset($this->projectRoles[$projectId]);
        } else {
            $projectRoles = $this->getOrCreateProjectRolesForProjectId($projectId);
            $projectRoles->setRoles($roles);
        }
    }

    /**
     * @param string $projectId
     *
     * @return string[]
     */
    public function getRoleIdsForProject(string $projectId)
    {
        $roles = $this->projectRoles[$projectId];
        if ($roles === null) {
            return [];
        }

        return $roles->getRoleIds();
    }

    /**
     * @return ProjectRoles[]
     */
    public function getProjectRoles()
    {
        return array_values($this->projectRoles->toArray());
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
        return $this->projectRoles[$projectId];
    }

    /**
     * @param string $projectId
     *
     * @return ProjectRoles
     */
    public function getOrCreateProjectRolesForProjectId(string $projectId)
    {
        $roles = $this->projectRoles[$projectId];

        if ($roles === null) {
            $roles                          = new ProjectRoles($projectId);
            $this->projectRoles[$projectId] = $roles;
        }

        return $roles;
    }

    /**
     * @return mixed
     */
    public function getOrganisations()
    {
        if ($this->organisations === null) {
            return [];
        }

        return $this->organisations;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     */
    public function assignToOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        if (!is_array($this->organisations) || !in_array($organisation->getId(), $this->organisations)) {
            $this->organisations[] = $organisation->getId();
        }
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     */
    public function removeFromOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        $idToRemove          = $organisation->getId();
        $this->organisations = array_filter(
            $this->organisations,
            function ($organisationId) use ($idToRemove) {
                if ($organisationId === $idToRemove) {
                    return false;
                }

                return true;
            }
        );
    }

    /**
     * @param mixed $organisations
     */
    public function setOrganisations($organisations)
    {
        $this->organisations = $organisations;
    }

    /**
     * @return \DateTime
     */
    public function getExpiresAt()
    {
        return $this->expiresAt;
    }

    /**
     * @return mixed
     */
    public function getCouchDbPassword()
    {
        return $this->couchDbPassword;
    }

    /**
     * @param mixed $couchDbPassword
     */
    public function setCouchDbPassword($couchDbPassword)
    {
        $this->couchDbPassword = $couchDbPassword;
    }

    /**
     * @param string $key
     * @param string $default
     *
     * @return string
     */
    public function getSetting(string $key, string $default = null)
    {
        if (isset($this->settings[$key])) {
            return $this->settings[$key];
        } else {
            return $default;
        }
    }
}
