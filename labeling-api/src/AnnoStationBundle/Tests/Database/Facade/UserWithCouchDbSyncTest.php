<?php

namespace AnnoStationBundle\Tests\Database\Facade;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;
use GuzzleHttp;
use Symfony\Component\Security\Core\Authentication\Token;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

class UserWithCouchDbSyncTest extends Tests\WebTestCase
{
    /**
     * @var Facade\UserWithCouchDbSync
     */
    protected $userFacade;

    /**
     * @var GuzzleHttp\Client
     */
    protected $guzzleClient;

    public function testCreateUser()
    {
        $username = 'fooobar';
        $user     = $this->userFacade->createUser(
            $username,
            'mail@domain.de',
            '12345'
        );

        $resource = $this->guzzleClient->request(
            'GET',
            $this->generateUserCouchDbUrl($username)
        );

        $this->assertEquals(200, $resource->getStatusCode());

        $resource = $this->guzzleClient->request(
            'GET',
            $this->getCurrentCouchDbSessionUrl($username, $user->getCouchDbPassword())
        );

        $response = json_decode($resource->getBody()->getContents(), true);

        $this->assertEquals(
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $username),
            $response['userCtx']['name']
        );
    }

    public function testUpdateUser()
    {
        $username = 'fooobar';
        $user     = $this->userFacade->createUser(
            $username,
            'mail@domain.de',
            '12345'
        );

        $resource = $this->guzzleClient->request(
            'GET',
            $this->getCurrentCouchDbSessionUrl($username, $user->getCouchDbPassword())
        );

        $response = json_decode($resource->getBody()->getContents(), true);

        $this->assertEquals(
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $username),
            $response['userCtx']['name']
        );

        $user->setPlainPassword('54321');

        $user = $this->userFacade->updateUser($user);

        $resource = $this->guzzleClient->request(
            'GET',
            $this->getCurrentCouchDbSessionUrl($username, $user->getCouchDbPassword())
        );

        $response = json_decode($resource->getBody()->getContents(), true);

        $this->assertEquals(
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $username),
            $response['userCtx']['name']
        );
    }

    public function testDeleteUser()
    {
        $this->createDefaultUser();

        $username = 'fooobar';
        $user     = $this->userFacade->createUser(
            $username,
            'mail@domain.de',
            '12345'
        );
        $this->userFacade->saveUser($user);

        $resource = $this->guzzleClient->request(
            'GET',
            $this->generateUserCouchDbUrl($username)
        );

        $this->assertEquals(200, $resource->getStatusCode());

        $this->getUserWithCouchDbSyncFacade()->deleteUser($user);

        $resource = $this->guzzleClient->request(
            'GET',
            $this->generateUserCouchDbUrl($username),
            ['http_errors' => false]
        );

        $this->assertEquals(404, $resource->getStatusCode());
    }

    private function generateUserCouchDbUrl($username, $authUsername = null, $authPassword = null)
    {
        if ($authUsername === null) {
            $authUsername = $this->getContainer()->getParameter('couchdb_user');
        }

        if ($authPassword === null) {
            $authPassword = $this->getContainer()->getParameter('couchdb_password');
        }

        return sprintf(
            'http://%s:%s@%s:%s/_users/%s%s%s',
            $authUsername,
            $authPassword,
            $this->getContainer()->getParameter('couchdb_host'),
            $this->getContainer()->getParameter('couchdb_port'),
            AppBundleFacade\CouchDbUsers::USERNAME_PREFIX,
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX,
            $username
        );
    }

    private function getCurrentCouchDbSessionUrl($authUsername, $authPassword)
    {
        return sprintf(
            'http://%s:%s@%s:%s/_session',
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $authUsername),
            $authPassword,
            $this->getContainer()->getParameter('couchdb_host'),
            $this->getContainer()->getParameter('couchdb_port')
        );
    }

    private function getUserWithCouchDbSyncFacade()
    {
        $tokenInterfaceMock = $this->getMockBuilder(Token\TokenInterface::class)
            ->disableOriginalConstructor()
            ->getMock();

        $tokenInterfaceMock->method('getUser')->willReturn(new Model\User());

        $tokenStorageMock = $this->getMockBuilder(Storage\TokenStorage::class)
            ->disableOriginalConstructor()
            ->getMock();
        $tokenStorageMock->method('getToken')->willReturn($tokenInterfaceMock);

        $user     = $this->getContainer()->getParameter(
            'couchdb_user'
        );
        $password = $this->getContainer()->getParameter(
            'couchdb_password'
        );
        $host     = $this->getContainer()->getParameter(
            'couchdb_host'
        );
        $port     = $this->getContainer()->getParameter(
            'couchdb_port'
        );

        return new Facade\UserWithCouchDbSync(
            $this->getService('fos_user.user_manager'),
            $this->getService('doctrine_couchdb.odm.default_document_manager'),
            $tokenStorageMock,
            $this->guzzleClient,
            $user,
            $password,
            $host,
            $port,
            $this->getService('annostation.labeling_api.database.facade.couchdb_users'),
            $this->getService('fos_user.util.token_generator')
        );
    }

    protected function setUpImplementation()
    {
        $this->userFacade   = $this->getAnnostationService(
            'database.facade.user_with_couch_db_sync'
        );
        $this->guzzleClient = $this->getService('guzzle.client');;
    }
}