<?php

namespace AppBundle\Security;

use AppBundle\Database\Facade\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
     * @fixme stateful service
     * @var bool
     */
    private $authenticated = false;

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

    private function checkLoginPage(Request $request)
    {
        $this->authenticated = false;

        if ($request->getPathInfo() != '/login_check') {
            return null;
        }

        if (!$content = $request->getContent()) {
            return null;
        }

        $data = array_merge(['username' => null, 'password' => null], json_decode($content, true));

        $request->getSession()->set(Security::LAST_USERNAME, $data['username']);
        return [
            'username' => $data['username'],
            'password' => $data['password'],
            'token' => null,
            'authMe' => true,
        ];

    }

    public function getCredentials(Request $request)
    {
        if ($credentials = $this->checkLoginPage($request)) {
            return $credentials;
        }

        $token = $request->headers->get('X-AUTH-TOKEN');
        $username = $request->headers->get('X-USERNAME');

        // What you return here will be passed to getUser() as $credentials
        return [
            'token' => $token,
            'username' => $username,
            'authMe' => false,
        ];
    }

    /**
     * @param string[] $credentials
     * @param UserProviderInterface $userProvider
     * @return \AppBundle\Model\User|\FOS\UserBundle\Model\UserInterface|null|UserInterface
     */
    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        $result = null;
        $username = $credentials['username'];
        $user = $userProvider->loadUserByUsername($username);

        if (!$credentials['authMe'] && $credentials['token'] && $credentials['token'] != $user->getToken()) {
            $user = null;
        } elseif ($credentials['token'] && $credentials['token'] == $user->getToken()) {
            $this->authenticated = true;
        }

        return $user;
    }

    public function checkCredentials($credentials, UserInterface $user)
    {
        if (!$credentials['authMe']) {
            return true;
        }

        $plainPassword = $credentials['password'];
        if ($this->encoder->isPasswordValid($user, $plainPassword)) {
            return true;
        }

        throw new BadCredentialsException();
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {
        if ($this->authenticated) {
            return null;
        }

        $user = $this->userFacade->getUserByUsername($token->getUsername());
        $token->setUser($user);
        /** @var \AppBundle\Model\User $user */
        $user = $this->secureToken->getToken()->getUser();

        //get our custom token
        $tokenStr = $user->getToken();

        if(!$tokenStr) {
            $tokenStr = uniqid(bin2hex($user->getUsername()));
            $user->setToken($tokenStr);
        }

        $this->userFacade->updateUser($user);

        return new JsonResponse(
            [
                'result' => [
                    'id'         => $user->getId(),
                    'username'   => $user->getUsername(),
                    'email'      => $user->getEmail(),
                    'roles'      => $user->getRoles(),
                    'expiresAt'  => $user->getExpiresAt(),
                    'XToken' => $tokenStr,
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
            ], 401
        );
    }

    protected function getLoginUrl()
    {
        return '/login';
    }

    protected function getDefaultSuccessRedirectUrl()
    {
    }

    public function supportsRememberMe()
    {
        return false;
    }
}