<?php

namespace AppBundle\Test;

use AppBundle;
use Symfony\Component\HttpFoundation;
use Symfony\Component\Security\Core;
use Symfony\Component\Security\Core\Authentication\Token;

class AuthenticationHandlerTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var AppBundle\AuthenticationHandler
     */
    private $authenticationHandler;

    /**
     * @var HttpFoundation\Request
     */
    private $request;

    /**
     * @var HttpFoundation\Session\SessionInterface
     */
    private $session;

    /**
     * @var Token\TokenInterface
     */
    private $token;

    public function setUp()
    {
        $this->authenticationHandler = new AppBundle\AuthenticationHandler();
        $this->request = $this->getMockBuilder(HttpFoundation\Request::class)->getMock();
        $this->session = $this->getMockBuilder(HttpFoundation\Session\SessionInterface::class)->getMock();
        $this->token = $this->getMockBuilder(Token\TokenInterface::class)->getMock();

        $this->request->method('getSession')->willReturn($this->session);
    }

    public function testStartReturnsUnauthorizedResponseOnXmlHttpRequest()
    {
        $this->request->method('isXmlHttpRequest')->willReturn(true);

        $response = $this->authenticationHandler->start($this->request);

        $this->assertEquals(HttpFoundation\Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testStartReturnsRedirectResponseOnNormalHttpRequest()
    {
        $this->request->method('isXmlHttpRequest')->willReturn(false);

        $response = $this->authenticationHandler->start($this->request);

        $this->assertEquals(HttpFoundation\Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertEquals('/login', $response->headers->get('Location'));
    }

    public function testOnAuthenticationSuccessReturnsNoContentResponseOnXmlHttpRequest()
    {
        $this->request->method('isXmlHttpRequest')->willReturn(true);

        $response = $this->authenticationHandler->onAuthenticationSuccess($this->request, $this->token);

        $this->assertEquals(HttpFoundation\Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testOnAuthenticationSuccessRedirectsToTargetUrlOnNormalHttpRequest()
    {
        $this->request->method('isXmlHttpRequest')->willReturn(false);
        $this->session->method('get')->willReturn('/labeling');

        $response = $this->authenticationHandler->onAuthenticationSuccess($this->request, $this->token);

        $this->assertEquals(HttpFoundation\Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertEquals('/labeling', $response->headers->get('Location'));
    }

    public function testOnAuthenticationFailureReturnsUnauthorizedResponseOnXmlHttpRequest()
    {
        $this->request->method('isXmlHttpRequest')->willReturn(true);

        $response = $this->authenticationHandler->onAuthenticationFailure(
            $this->request,
            new Core\Exception\AuthenticationException()
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testOnAuthenticationFailureRedirectsToLoginFormOnNormalHttpRequest()
    {
        $this->request->method('isXmlHttpRequest')->willReturn(false);

        $response = $this->authenticationHandler->onAuthenticationFailure(
            $this->request,
            new Core\Exception\AuthenticationException()
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertEquals('/login', $response->headers->get('Location'));
    }
}
