<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AppBundle\Model\User;
use Symfony\Component\HttpFoundation;

class CustomExceptionTest extends Tests\WebTestCase
{
    private $client = null;

    public function testNotFoundHttpException()
    {
        $requestWrapper = $this->createRequest('/api/v1/foobar')
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $expectedResponseBody = [
            'error' => [
                'type'    => 'NotFoundHttpException',
                'code'    => HttpFoundation\Response::HTTP_NOT_FOUND,
                'message' => 'No route found for "DELETE /api/v1/foobar"',
            ],
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals($expectedResponseBody, $this->getRelevantJsonBody($requestWrapper));
    }

    public function testBadRequestHttpException()
    {

        $requestWrapper = $this->createRequest('/api/v1/currentUser/password')
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
             ->setJsonBody(
                 [
                     'oldPassword' => 'test',
                 ]
             )
             ->execute();

        $expectedResponseBody = [
            'result' =>
                [
                    'error' => [
                        [
                            'field'   => 'newPassword',
                            'message' => 'Failed to save the new password. The current password is not correct',
                        ],
                    ],
                ]
        ];

        $this->assertEquals($expectedResponseBody, $this->getRelevantJsonBody($requestWrapper));
    }

    protected function setUpImplementation()
    {
        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);

        $this->createDefaultUser();
        $this->defaultUser->setRoles([User::ROLE_SUPER_ADMIN]);

        $this->client = static::createClient();

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
