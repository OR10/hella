<?php

namespace AppBundle\Service;

use Doctrine\CouchDB;
use Doctrine\ODM\CouchDB as CouchDBODM;
use GuzzleHttp\Client;

class CouchDbReplicatorService
{
    /**
     * @var string
     */
    private $host;

    /**
     * @var string
     */
    private $port;

    /**
     * @var string
     */
    private $username;

    /**
     * @var string
     */
    private $password;

    public function __construct($host, $port, $username, $password)
    {
        $this->host     = $host;
        $this->port     = $port;
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * @param      $sourceDb
     * @param      $targetDb
     * @param bool $continuous
     * @param null $filter
     * @param null $queryParams
     * @param null $docIds
     *
     * @return mixed|\Psr\Http\Message\ResponseInterface
     */
    public function addReplication(
        $sourceDb,
        $targetDb,
        $continuous = false,
        $filter = null,
        $queryParams = null,
        $docIds = null
    ) {
        $params = [
            'source'     => $sourceDb,
            'target'     => $targetDb,
            'continuous' => $continuous,
        ];

        if ($filter !== null) {
            $params['filter'] = $filter;
        }

        if ($docIds !== null) {
            $params['doc_ids'] = $docIds;
        }

        if ($queryParams !== null) {
            $params['query_params'] = $queryParams;
        }

        $client = new Client(
            [
                'base_uri' => sprintf(
                    'http://%s:%s@%s:%s/_replicator',
                    $this->username,
                    $this->password,
                    $this->host,
                    $this->port
                ),
            ]
        );

        return $client->request(
            'PUT',
            sprintf('_replicator/%s_%s', $sourceDb, $targetDb),
            ['json' => $params]
        );
    }
}