<?php

namespace AppBundle\Service\Validation\Model;

/**
 * Class VerifyUsername
 * @package AppBundle\Service\Validation\Model
 */
class VerifyUsername
{

    private $username;

    /**
     * VerifyUsername constructor.
     * @param $username
     */
    public function __construct($username)
    {
        $this->username = $username;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @param mixed $username
     */
    public function setUsername($username)
    {
        $this->username = $username;
    }
}