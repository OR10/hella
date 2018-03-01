<?php

namespace AppBundle\Service\Validation\Model;

use AppBundle\Model\User;

/**
 * Class VerifyUserOrganisation
 * @package AppBundle\Service\Validation\Model
 */
class VerifyUserOrganisation
{
    /**
     * @var User
     */
    protected $user;

    /**
     * @var array
     */
    protected $organisationIds = [];

    /**
     * VerifyUserOrganisation constructor.
     *
     * @param User $user
     * @param array $organisationIds
     */
    public function __construct(User $user, array $organisationIds)
    {
        $this->user = $user;
        $this->organisationIds = $organisationIds;
    }

    /**
     * @return User
     */
    public function getUser(): User
    {
        return $this->user;
    }

    /**
     * @return array
     */
    public function getOrganisationIds(): array
    {
        return $this->organisationIds;
    }
}