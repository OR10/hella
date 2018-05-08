<?php

namespace AppBundle\Security;

use AppBundle\Database\Facade\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Logout\LogoutHandlerInterface;

class LogoutHandler implements LogoutHandlerInterface
{
    /**
     * @var User
     */
    private $userFacade;

    /**
     * @var TokenStorage
     */
    private $secureToken;

    public function __construct(User $userFacade, TokenStorage $tokenStorage)
    {
        $this->userFacade  = $userFacade;
        $this->secureToken = $tokenStorage;
    }

    /**
     * @{inheritDoc}
     */
    public function logout(Request $request, Response $response, TokenInterface $token)
    {
        $this->secureToken->setToken(null);

        if ($user = $token->getUser()) {
            $user->setToken(null);
            $this->userFacade->updateUser($user);
        }

        $response->headers->set('Location', '/labeling/login');
    }
}
