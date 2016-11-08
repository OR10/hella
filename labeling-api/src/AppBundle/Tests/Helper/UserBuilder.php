<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;

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
     * Declare private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * Create a default client.
     *
     * @return UserBuilder
     */
    public static function createDefaultClient()
    {
        return self::create()
            ->withUsername('client')
            ->withPlainPassword('client')
            ->withRoles([Model\User::ROLE_CLIENT]);
    }

    /**
     * Create a default label coordinator.
     *
     * @return UserBuilder
     */
    public static function createDefaultLabelCoordinator()
    {
        return self::create()
            ->withUsername('label_coordinator')
            ->withPlainPassword('label_coordinator')
            ->withRoles([Model\User::ROLE_LABEL_COORDINATOR]);
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
        $user->setEnabled(true);

        return $user;
    }
}
