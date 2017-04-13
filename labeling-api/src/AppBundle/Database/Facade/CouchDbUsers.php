<?php

namespace AppBundle\Database\Facade;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use Doctrine\ODM\CouchDB as CouchDbODM;
use GuzzleHttp;

class CouchDbUsers
{
    const USERNAME_PREFIX = 'org.couchdb.user:';

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var string
     */
    private $couchAuthUser;

    /**
     * @var string
     */
    private $couchAuthPassword;

    /**
     * @var string
     */
    private $couchHost;

    /**
     * @var string
     */
    private $couchPort;

    public function __construct(
        GuzzleHttp\Client $guzzleClient,
        $couchAuthUser,
        $couchAuthPassword,
        $couchHost,
        $couchPort
    ) {
        $this->guzzleClient      = $guzzleClient;
        $this->couchAuthUser     = $couchAuthUser;
        $this->couchAuthPassword = $couchAuthPassword;
        $this->couchHost         = $couchHost;
        $this->couchPort         = $couchPort;
    }

    public function purgeCouchDbsUserDatabase($prefix = null)
    {
        $usernames = $this->getAllUserDocuments();
        foreach ($usernames as $username) {
            if ($prefix !== null) {
                if (strpos($username, $prefix) !== 0) {
                    continue;
                }
            }

            $this->deleteUser($username);
        }
    }

    /**
     * @param $username
     */
    public function deleteUser($username)
    {
        $resource = $this->guzzleClient->request(
            'GET',
            $this->generateCouchDbUrl($username),
            ['http_errors' => false]
        );
        if ($resource->getStatusCode() === 200) {
            $couchDbUser = json_decode($resource->getBody()->getContents(), true);
            $this->guzzleClient->request(
                'DELETE',
                $this->generateCouchDbUrl($username),
                [
                    'headers' => [
                        'If-Match' => $couchDbUser['_rev'],
                    ],
                ]
            );
        }
    }

    /**
     * @param $username
     * @param $password
     */
    public function updateUser($username, $password)
    {
        if ($password !== null) {
            $resource = $this->guzzleClient->request(
                'GET',
                $this->generateCouchDbUrl($username),
                ['http_errors' => false]
            );
            if ($resource->getStatusCode() === 200) {
                $couchDbUser = json_decode($resource->getBody()->getContents(), true);
                $this->createOrUpdateCouchDbUserDocument($username, $password, $couchDbUser['_rev']);
            } else {
                $this->createOrUpdateCouchDbUserDocument($username, $password);
            }
        }
    }

    /**
     * @param      $username
     * @param      $password
     * @param null $revision
     */
    private function createOrUpdateCouchDbUserDocument($username, $password, $revision = null)
    {
        $this->guzzleClient->request(
            'PUT',
            $this->generateCouchDbUrl($username),
            [
                'headers' => [
                    'If-Match' => $revision,
                ],
                'json'    => [
                    'name'     => $username,
                    'password' => $password,
                    'type'     => 'user',
                    'roles'    => [],
                ],
            ]
        );
    }

    /**
     * @return array
     */
    private function getAllUserDocuments()
    {
        $resource = $this->guzzleClient->request(
            'GET',
            sprintf(
                'http://%s:%s@%s:%s/_users/_all_docs',
                $this->couchAuthUser,
                $this->couchAuthPassword,
                $this->couchHost,
                $this->couchPort
            ),
            ['http_errors' => false]
        );

        $couchDbUsers = array_filter(
            json_decode($resource->getBody()->getContents(), true)['rows'],
            function ($doc) {
                return (strpos($doc['id'], self::USERNAME_PREFIX) === 0);
            }
        );

        $couchDbUsers = array_map(
            function ($user) {
                preg_match('/^(org.couchdb.user:)(\w+)$/', $user['id'], $matches);
                return $matches[2];
            },
            $couchDbUsers
        );

        return $couchDbUsers;
    }

    /**
     * @param $username
     *
     * @return string
     */
    private function generateCouchDbUrl($username)
    {
        return sprintf(
            'http://%s:%s@%s:%s/_users/%s%s',
            $this->couchAuthUser,
            $this->couchAuthPassword,
            $this->couchHost,
            $this->couchPort,
            self::USERNAME_PREFIX,
            $username
        );
    }
}
