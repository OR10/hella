<?php
namespace AppBundle\Service\Validation\Model;

use AppBundle\Model\User;

/**
 * Class VerifyUserPassword
 * @package DataStationBundle\Service\Validation\Model
 */
class VerifyUserPassword
{
    /**
     * @var User
     */
    private $user;
    /**
     * @var string
     */
    private $password;

    /**
     * VerifyUserPassword constructor.
     *
     * @param User   $user
     * @param string $password
     */
    public function __construct(User $user, string $password)
    {
        $this->user     = $user;
        $this->password = $password;
    }

    /**
     * @return User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }
}
