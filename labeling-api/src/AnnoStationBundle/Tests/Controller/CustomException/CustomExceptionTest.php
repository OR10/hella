<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use Symfony\Component\HttpFoundation;

class CustomExceptionTest extends Tests\WebTestCase
{
    public function testNotFoundHttpException()
    {
        $requestWrapper = $this->createRequest('/api/foobar')
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $expectedResponseBody = [
            'error' => [
                'type'    => 'NotFoundHttpException',
                'code'    => HttpFoundation\Response::HTTP_NOT_FOUND,
                'message' => 'No route found for "DELETE /api/foobar"',
            ],
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals($expectedResponseBody, $this->getRelevantJsonBody($requestWrapper));
    }

    public function testBadRequestHttpException()
    {
        $requestWrapper = $this->createRequest('/api/currentUser/password')
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->execute();

        $expectedResponseBody = [
            'error' => [
                'type'    => 'BadRequestHttpException',
                'code'    => HttpFoundation\Response::HTTP_BAD_REQUEST,
                'message' => 'Failed to save the new password. The current password is not correct',
            ],
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals($expectedResponseBody, $this->getRelevantJsonBody($requestWrapper));
    }

    protected function setUpImplementation()
    {
        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }

    /**
     * @param Tests\RequestWrapper $requestWrapper
     *
     * @return array
     */
    private function getRelevantJsonBody(Tests\RequestWrapper $requestWrapper)
    {
        $body = $requestWrapper->getJsonResponseBody();

        if (is_array($body) && isset($body['error']['exception'])) {
            unset($body['error']['exception']);
        }

        return $body;
    }
}
