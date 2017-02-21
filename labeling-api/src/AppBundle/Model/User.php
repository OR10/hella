<?php

namespace AppBundle\Model;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use AnnoStationBundle\Model as AnnoStationBundleModel;

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
     * @CouchDB\Field(type="mixed")
     */
    protected $rolesByProject = [];

    /**
     * @CouchDB\Field(type="mixed")
     */
    protected $organisations = [];

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
     * @param string $role
     */
    public function assignRole(string $projectId, string $role)
    {
        if ($this->rolesByProject === null) {
            $this->rolesByProject = [];
        }

        if (!in_array($role, $this->rolesByProject[$projectId] ?? [])) {
            $this->rolesByProject[$projectId][] = $role;
        }
    }

    /**
     * @param string $projectId
     *
     * @return string[]
     */
    public function getRolesForProject(string $projectId)
    {
        return $this->rolesByProject[$projectId] ?? [];
    }

    /**
     * @return mixed
     */
    public function getOrganisations()
    {
        return $this->organisations;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     */
    public function assignToOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        if (!in_array($organisation->getId(), $this->organisations)) {
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
}
