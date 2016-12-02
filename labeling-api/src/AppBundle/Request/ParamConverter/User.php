<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class User extends LookupBase
{
    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @param Facade\User $userFacade
     */
    public function __construct(Facade\User $userFacade)
    {
        $this->userFacade = $userFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\User::class;
    }

    protected function resolveParameter($id)
    {
        return $this->userFacade->getUserById($id);
    }
}
