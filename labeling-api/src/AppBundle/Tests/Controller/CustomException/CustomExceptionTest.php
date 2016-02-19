<?php

namespace AppBundle\Tests\Controller\Api;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class CustomExceptionTest extends Tests\WebTestCase
{
    /**
     * @dataProvider requestProvider
     *
     * @param $route
     * @param $method
     * @param $expectedResponseCode
     * @param $expectedResponseContent
     */
    public function testRequestExceptions($route, $method, $expectedResponseCode, $expectedResponseContent)
    {
        $response = $this->createRequest($route, array('debug' => false))
            ->setMethod($method)
            ->execute()
            ->getResponse();

        $this->assertEquals($expectedResponseCode, $response->getStatusCode());

        $responseContent = json_decode($response->getContent(), true);

        $this->assertEquals($expectedResponseContent['error']['type'], $responseContent['error']['type']);
        $this->assertEquals($expectedResponseContent['error']['code'], $responseContent['error']['code']);
        $this->assertEquals($expectedResponseContent['error']['message'], $responseContent['error']['message']);
    }

    public function requestProvider()
    {
        return array(
            array(
                '/api/foobar',
                HttpFoundation\Request::METHOD_DELETE,
                HttpFoundation\Response::HTTP_NOT_FOUND,
                array(
                    'error' => array(
                        'type' => 'NotFoundHttpException',
                        'code' => 404,
                        'message' => 'No route found for "DELETE /api/foobar"',
                    )
                )
            ),
            array(
                '/api/user/password',
                HttpFoundation\Request::METHOD_PUT,
                HttpFoundation\Response::HTTP_BAD_REQUEST,
                array(
                    'error' => array(
                        'type' => 'BadRequestHttpException',
                        'code' => 400,
                        'message' => 'Failed to save the new password. The current password is not correct',
                    )
                )
            )
        );
    }

    protected function setUpImplementation()
    {
        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}