<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Controller\Api;
use GuzzleHttp;

class SystemTest extends Tests\WebTestCase
{
    protected function setUpImplementation()
    {
        $guzzleResponseMock = $this->getGuzzleResponseMock();
        $guzzleResponseMock->method('getBody')
            ->willReturn(json_encode([]));

        $guzzleMock = $this->getGuzzleClientMock();
        $guzzleMock->expects($this->any())
            ->method('request')
            ->willReturn($guzzleResponseMock);

        $this->setService('guzzle.client', $guzzleMock);
    }

    public function testGetQueuesWithPermission()
    {
        $superAdmin     = $this->createSuperAdminUser();
        $requestWrapper = $this->createRequest('/api/v1/system/queues')
            ->withCredentialsFromUsername($superAdmin)
            ->execute();

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
    }

    public function testGetQueuesWithoutPermission()
    {
        $labelManager     = $this->createLabelManagerUser();
        $requestWrapper = $this->createRequest('/api/v1/system/queues')
            ->withCredentialsFromUsername($labelManager)
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
    }

    private function getGuzzleClientMock()
    {
        return $this->getMockBuilder(GuzzleHttp\Client::class)
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
