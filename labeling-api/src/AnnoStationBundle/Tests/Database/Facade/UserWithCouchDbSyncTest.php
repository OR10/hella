<?php

namespace AnnoStationBundle\Tests\Database\Facade;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;
use GuzzleHttp;
use Symfony\Component\Security\Core\Authentication\Token;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Psr\Http\Message;

class UserWithCouchDbSyncTest extends Tests\WebTestCase
{
    private function getGuzzleClientMock()
    {
        return $this->getMockBuilder(GuzzleHttp\Client::class)
            ->disableOriginalConstructor()
            ->setMethods(['request'])
            ->getMock();
    }

    private function getGuzzleResponseMock()
    {
        return $this->getMockBuilder(GuzzleHttp\Psr7\Response::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    private function getGuzzleBodyMock()
    {
        return $this->getMockBuilder(Message\StreamInterface::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    private function getTokenStorageMock()
    {
        return $this->getMockBuilder(Storage\TokenStorage::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    private function getTokenInterfaceMock()
    {
        return $this->getMockBuilder(Token\TokenInterface::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    private function getCouchDbUsersFacadeMock()
    {
        return $this->getMockBuilder(AppBundleFacade\CouchDbUsers::class)
            ->disableOriginalConstructor()
            ->getMock();
    }

    public function testCreateUser()
    {
        $mock = $this->getGuzzleClientMock();

        $this->getUserWithCouchDbSyncFacade($mock, $this->getTokenStorageMock())->createUser(
            'foobar',
            'mail@domain.de',
            'pass'
        );
    }

    public function testUpdateUser()
    {
        $responseMock = $this->getGuzzleResponseMock();
        $responseMock->method('getStatusCode')->willReturn(404);

        $guzzleMock = $this->getGuzzleClientMock();
        $guzzleMock->method('request')->willReturn($responseMock);

        $user = $this->createSuperAdminUser();
        $user->setPlainPassword('foobar');
        $this->getUserWithCouchDbSyncFacade($guzzleMock, $this->getTokenStorageMock())->updateUser($user);
    }

    public function testDeleteUser()
    {
        $bodyMock = $this->getGuzzleBodyMock();
        $bodyMock->method('getContent')->willReturn(json_encode([]));

        $responseMock = $this->getGuzzleResponseMock();
        $responseMock->method('getBody')->willReturn($bodyMock);

        $guzzleMock = $this->getGuzzleClientMock();
        $guzzleMock->method('request')->willReturn($responseMock);

        $tokenInterfaceMock = $this->getTokenInterfaceMock();
        $tokenInterfaceMock->method('getUser')->willReturn(new Model\User());

        $tokenStorageMock = $this->getTokenStorageMock();
        $tokenStorageMock->method('getToken')->willReturn($tokenInterfaceMock);

        $user = $this->createSuperAdminUser();
        $this->getUserWithCouchDbSyncFacade($guzzleMock, $tokenStorageMock)->deleteUser($user);
    }

    private function getUserWithCouchDbSyncFacade($guzzleMock, $tokenStorageMock)
    {
        $user = static::createClient()->getKernel()->getContainer()->getParameter(
            'couchdb_user'
        );

        $password = static::createClient()->getKernel()->getContainer()->getParameter(
            'couchdb_password'
        );

        $host = static::createClient()->getKernel()->getContainer()->getParameter(
            'couchdb_host'
        );

        $port = static::createClient()->getKernel()->getContainer()->getParameter(
            'couchdb_port'
        );

        return new Facade\UserWithCouchDbSync(
            $this->getService('fos_user.user_manager'),
            $this->getService('doctrine_couchdb.odm.default_document_manager'),
            $tokenStorageMock,
            $guzzleMock,
            $user,
            $password,
            $host,
            $port,
            $this->getCouchDbUsersFacadeMock()
        );
    }
}