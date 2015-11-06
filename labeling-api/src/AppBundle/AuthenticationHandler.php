<?php

namespace AppBundle;

use Symfony\Component\HttpFoundation;
use Symfony\Component\Security\Core;
use Symfony\Component\Security\Core\Authentication\Token;
use Symfony\Component\Security\Http\Authentication;
use Symfony\Component\Security\Http\EntryPoint;

/**
 * Authentication handler which prevents redirection to login form and basic
 * auth prompt in case of xhr requests but instead returns a 401 response
 * without a challenge.
 * In case of a "normal" http request a redirect response is returned which
 * redirects to the login form which in turn redirects to an optionally
 * provided `targetUrl` or a default path if `targetUrl` was not provided by
 * the request.
 *
 * @todo inject config values?
 */
class AuthenticationHandler implements
    Authentication\AuthenticationSuccessHandlerInterface,
    Authentication\AuthenticationFailureHandlerInterface,
    EntryPoint\AuthenticationEntryPointInterface
{
    /**
     * @var string
     */
    private $targetUrlParameter = 'targetUrl';

    /**
     * @var string
     */
    private $defaultSuccessPath = '/labeling';

    /**
     * @var string
     */
    private $failurePath = '/login';

    /**
     * Gets called whenever an authentication cycle is started.
     *
     * Returns a 401 response in case of a xhr request, otherwise saves the
     * targetUrl in the session and redirects to the login form.
     *
     * @param HttpFoundation\Request                 $request
     * @param Core\Exception\AuthenticationException $authException
     *
     * @return HttpFoundation\Response
     */
    public function start(
        HttpFoundation\Request $request,
        Core\Exception\AuthenticationException $authException = null
    ) {
        if ($request->isXmlHttpRequest()) {
            return new HttpFoundation\Response(null, HttpFoundation\Response::HTTP_UNAUTHORIZED);
        }

        return new HttpFoundation\RedirectResponse($this->failurePath);
    }

    /**
     * Gets called after a successful authentication.
     *
     * Returns a 204 response in case of a xhr request, otherwise redirects to
     * the targetUrl which was registered in the session by
     * `AuthenticationHandler::start()`.
     *
     * @param HttpFoundation\Request $request
     * @param Token\TokenInterface   $token
     *
     * @return HttpFoundation\Response
     */
    public function onAuthenticationSuccess(
        HttpFoundation\Request $request,
        Token\TokenInterface $token
    ) {
        if ($request->isXmlHttpRequest()) {
            return new HttpFoundation\Response(null, HttpFoundation\Response::HTTP_NO_CONTENT);
        }

        $targetUrl = $request->get($this->targetUrlParameter);
        if ($targetUrl === null || empty($targetUrl)) {
            $targetUrl = $this->defaultSuccessPath;
        }

        return new HttpFoundation\RedirectResponse($targetUrl);
    }

    /**
     * Gets called after a failed authentication.
     *
     * Returns a 401 response in case of a xhr request, otherwise redirects to
     * the login form.
     *
     * @param HttpFoundation\Request                 $request
     * @param Core\Exception\AuthenticationException $authException
     *
     * @return HttpFoundation\Response
     */
    public function onAuthenticationFailure(
        HttpFoundation\Request $request,
        Core\Exception\AuthenticationException $authException
    ) {
        if ($request->isXmlHttpRequest()) {
            return new HttpFoundation\Response(null, HttpFoundation\Response::HTTP_UNAUTHORIZED);
        }

        return new HttpFoundation\RedirectResponse($this->failurePath);
    }
}
