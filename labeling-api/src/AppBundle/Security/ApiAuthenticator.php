<?php

namespace AppBundle\Security;

use AppBundle\Database\Facade\User;
use AppBundle\View\View;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Guard\Authenticator\AbstractFormLoginAuthenticator;
use Symfony\Component\Security\Core\Security;

/**
 * Class ApiAuthenticator
 * @package AppBundle\Security
 * UI authentication
 */
class ApiAuthenticator extends AbstractFormLoginAuthenticator
{

    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var UserPasswordEncoderInterface
     */
    private $encoder;

    /**
     * @var User
     */
    private $userFacade;

    /**
     * @var TokenStorage
     */
    private $secureToken;

    /**
     * ApiAuthenticator constructor.
     * @param RouterInterface $router
     * @param UserPasswordEncoderInterface $encoder
     * @param User $userFacade
     * @param TokenStorage $tokenStorage
     */
    public function __construct(
        RouterInterface $router,
        UserPasswordEncoderInterface $encoder,
        User $userFacade,
        TokenStorage $tokenStorage)
    {
        $this->router      = $router;
        $this->encoder     = $encoder;
        $this->userFacade  = $userFacade;
        $this->secureToken = $tokenStorage;
    }

    public function getCredentials(Request $request)
    {
        if ($request->getPathInfo() != '/login_check') {
            return;
        }

        $email = $request->request->get('_username');
        $request->getSession()->set(Security::LAST_USERNAME, $email);
        $password = $request->request->get('_password');

        return [
            'username' => $email,
            'password' => $password,
        ];
    }

    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        $username = $credentials['username'];
        return $this->userFacade->getUserByUsername($username);
    }

    public function checkCredentials($credentials, UserInterface $user)
    {
        $plainPassword = $credentials['password'];
        if ($this->encoder->isPasswordValid($user, $plainPassword)) {
            return true;
        }

        throw new BadCredentialsException();
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {

        $user = $this->userFacade->getUserByUsername($token->getUsername());
        $token->setUser($user);
        $user = $this->secureToken->getToken()->getUser();

        //get oAuth token
        $token = $user->getToken();
        if(!$token) {
            $token = uniqid(bin2hex($user->getUsername()));
            $user->setToken($token);
            $this->userFacade->updateUser($user);
        }

        return new JsonResponse(
            [
                'result' => [
                    'id'         => $user->getId(),
                    'username'   => $user->getUsername(),
                    'email'      => $user->getEmail(),
                    'roles'      => $user->getRoles(),
                    'expiresAt'  => $user->getExpiresAt(),
                    'oAuthToken' => $token
                ],
            ]
        );
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        $request->getSession()->set(Security::AUTHENTICATION_ERROR, $exception);
        return new JsonResponse(
            [
                'result' => [
                    'Failed to login'
                ],
            ]
        );
    }

    protected function getLoginUrl()
    {

    }

    protected function getDefaultSuccessRedirectUrl()
    {

    }

    public function supportsRememberMe()
    {
        return false;
    }
}