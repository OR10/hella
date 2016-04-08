<?php
namespace AppBundle\Security;

use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use AppBundle\Database\Facade;

class ApiKeyUserProvider implements UserProviderInterface
{
    /**
     * @var Facade\User
     */
    private $userFacade;

    public function __construct(Facade\User $userFacade)
    {
        $this->userFacade = $userFacade;
    }

    public function loadUserByUsername($apiKey)
    {
        return $this->userFacade->getUserByToken($apiKey);
    }

    public function refreshUser(UserInterface $user)
    {
        // this is used for storing authentication in the session
        // but in this example, the token is sent in each request,
        // so authentication can be stateless. Throwing this exception
        // is proper to make things stateless
        throw new UnsupportedUserException();
    }

    public function supportsClass($class)
    {
        return is_subclass_of(User::class, $class);
    }
}