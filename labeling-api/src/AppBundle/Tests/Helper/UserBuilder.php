<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class UserBuilder
{
    /**
     * @var string
     */
    private $username = 'testuser';

    /**
     * @var string
     */
    private $plainPassword = 'testuser';

    /**
     * @var string[]
     */
    private $roles = [Model\User::ROLE_DEFAULT];

    /**
     * @var string
     */
    private $email;

    /**
     * @var AnnoStationBundleModel\Organisation[]
     */
    private $organisations = [];

    /**
     * Declare private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * Create a default super admin.
     *
     * @return UserBuilder
     */
    public static function createDefaultSuperAdmin()
    {
        return self::create()
            ->withUsername('superadmin')
            ->withPlainPassword('superadmin')
            ->withRoles([Model\User::ROLE_SUPER_ADMIN]);
    }

    /**
     * Create a default admin.
     *
     * @return UserBuilder
     */
    public static function createDefaultLabelManager()
    {
        return self::create()
            ->withUsername('label_manager')
            ->withPlainPassword('label_manager')
            ->withRoles([Model\User::ROLE_LABEL_MANAGER]);
    }

    /**
     * Create a default labeler.
     *
     * @return UserBuilder
     */
    public static function createDefaultLabeler()
    {
        return self::create()
            ->withUsername('labeler')
            ->withPlainPassword('labeler')
            ->withRoles([Model\User::ROLE_LABELER]);
    }

    /**
     * @param array $roles
     *
     * @return UserBuilder
     */
    public function withRoles(array $roles)
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @param string $username
     *
     * @return UserBuilder
     */
    public function withUsername(string $username)
    {
        $this->username = $username;

        return $this;
    }

    /**
     * @param string $password
     *
     * @return UserBuilder
     */
    public function withPlainPassword(string $password)
    {
        $this->plainPassword = $password;

        return $this;
    }

    /**
     * @param string $email
     *
     * @return UserBuilder
     */
    public function withEmail(string $email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * @param array $organisations
     *
     * @return $this
     */
    public function withOrganisations(array $organisations)
    {
        $this->organisations = $organisations;

        return $this;
    }

    /**
     * @return UserBuilder
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @return Model\User
     */
    public function build()
    {
        $user = new Model\User();

        $user->setUsername($this->username);
        $user->setPlainPassword($this->plainPassword);
        $user->setRoles($this->roles);
        $user->setEmail($this->email);
        $user->setEnabled(true);

        foreach ($this->organisations as $organisation) {
            $user->assignToOrganisation($organisation);
        }

        return $user;
    }
}
