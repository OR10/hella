<?php

namespace AppBundle\Model;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;


/**
 * @CouchDB\Document
 */
class User extends BaseUser
{
    const ROLE_ADMIN = 'ROLE_ADMIN';
    const ROLE_LABEL_COORDINATOR = 'ROLE_LABEL_COORDINATOR';
    const ROLE_LABELER = 'ROLE_LABELER';
    const ROLE_CLIENT = 'ROLE_CLIENT';

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
}
