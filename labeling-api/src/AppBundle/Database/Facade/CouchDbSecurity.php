<?php

namespace AppBundle\Database\Facade;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use Doctrine\ODM\CouchDB as CouchDbODM;
use GuzzleHttp;

class CouchDbSecurity
{
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

    /**
     * @param       $database
     * @param array $memberNames
     * @param array $memberRoles
     * @param array $adminNames
     * @param array $adminRoles
     */
    public function updateSecurity($database, $memberNames = [], $memberRoles = [], $adminNames = [], $adminRoles = [])
    {
        $this->guzzleClient->request(
            'PUT',
            $this->generateCouchDbUrl($database),
            [
                'json' => [
                    'admins'  => [
                        'names' => $adminNames,
                        'roles' => $adminRoles,
                    ],
                    'members' => [
                        'names' => $memberNames,
                        'roles' => $memberRoles,
                    ],
                ],
            ]
        );
    }

    /**
     * @param $database
     *
     * @return string
     */
    private function generateCouchDbUrl($database)
    {
        return sprintf(
            'http://%s:%s@%s:%s/%s/_security',
            $this->couchAuthUser,
            $this->couchAuthPassword,
            $this->couchHost,
            $this->couchPort,
            $database
        );
    }
}
