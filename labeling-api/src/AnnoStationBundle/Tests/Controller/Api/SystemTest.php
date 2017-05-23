<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Controller\Api;
use GuzzleHttp;

class SystemTest extends Tests\WebTestCase
{
    public function testGetQueuesWithPermission()
    {
        $userPermissionMock = $this->getUserPermissionsMock();
        $userPermissionMock
            ->expects($this->once())
            ->method('hasPermission')
            ->with('canCreateOrganisation')
            ->willReturn(true);

        $guzzleResponseMock = $this->getGuzzleResponseMock();
        $guzzleResponseMock->method('getBody')
            ->willReturn(json_encode([]));

        $guzzleMock = $this->getGuzzleClientMock();
        $guzzleMock->expects($this->once())
            ->method('request')
            ->willReturn($guzzleResponseMock);

        $system = new Api\System($userPermissionMock, $guzzleMock, '', '', '', '');

        $request = $system->queuedMessagesAction();

        $this->assertEquals(200, $request->getStatusCode());
    }

    /**
     * @expectedException Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
     */
    public function testGetQueuesWithoutPermission()
    {
        $userPermissionMock = $this->getUserPermissionsMock();
        $userPermissionMock
            ->expects($this->once())
            ->method('hasPermission')
            ->with('canCreateOrganisation')
            ->willReturn(false);

        $guzzleMock = $this->getGuzzleClientMock();

        $system = new Api\System($userPermissionMock, $guzzleMock, '', '', '', '');

        $system->queuedMessagesAction();
    }

    private function getGuzzleClientMock()
    {
        return $this->getMockBuilder(GuzzleHttp\Client::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    private function getUserPermissionsMock()
    {
        return $this->getMockBuilder(Authentication\UserPermissions::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    private function getGuzzleResponseMock()
    {
        return $this->getMockBuilder(GuzzleHttp\Psr7\Response::class)
            ->disableOriginalConstructor()
            ->getMock();
    }
}