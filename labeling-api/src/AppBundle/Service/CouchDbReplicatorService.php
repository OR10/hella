<?php

namespace AppBundle\Service;

use Doctrine\CouchDB;
use Doctrine\ODM\CouchDB as CouchDBODM;
use GuzzleHttp;

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
    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    public function __construct(GuzzleHttp\Client $guzzleClient, $host, $port, $username, $password)
    {
        $this->guzzleClient = $guzzleClient;
        $this->host         = $host;
        $this->port         = $port;
        $this->username     = $username;
        $this->password     = $password;
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

        return $this->guzzleClient->request(
            'PUT',
            sprintf(
                'http://%s:%s@%s:%s/_replicator/%s_%s',
                $this->username,
                $this->password,
                $this->host,
                $this->port,
                $sourceDb,
                $targetDb
            ),
            ['json' => $params]
        );
    }

    /**
     * @param $db
     *
     * @return bool
     */
    public function isReplicationActive($db)
    {
        $request = $this->guzzleClient->request(
            'GET',
            sprintf(
                'http://%s:%s@%s:%s/_active_tasks',
                $this->username,
                $this->password,
                $this->host,
                $this->port
            )
        );

        $activeTasks = json_decode($request->getBody()->getContents(), true);

        foreach ($activeTasks as $activeTask) {
            if ($activeTask['source'] === $db || $activeTask['target'] === $db) {
                return true;
            }
        }

        return false;
    }
}