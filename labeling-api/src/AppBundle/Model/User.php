<?php

namespace AppBundle\Model;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="users")
 */
class User extends BaseUser
{
    const ROLE_ADMIN = 'ROLE_ADMIN';
    const ROLE_LABEL_COORDINATOR = 'ROLE_LABEL_COORDINATOR';
    const ROLE_LABELER = 'ROLE_LABELER';

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    public function __construct()
    {
        parent::__construct();
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
}
