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
     * Create a default label coordinator.
     *
     * @return UserBuilder
     */
    public static function createDefaultLabelCoordinator()
    {
        return self::create()
            ->withUsername('foobar_label_coordinator')
            ->withRoles([Model\User::ROLE_LABEL_COORDINATOR]);
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
        $user->setRoles($this->roles);
        $user->setEnabled(true);

        return $user;
    }
}