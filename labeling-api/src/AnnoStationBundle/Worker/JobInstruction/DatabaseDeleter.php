<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AppBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use crosscan\WorkerPool\Exception;
use Doctrine\ODM\CouchDB;

class DatabaseDeleter extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Service\CouchDbReplicatorService
     */
    private $couchDbReplicatorService;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(
        Service\CouchDbReplicatorService $couchDbReplicatorService,
        CouchDB\DocumentManager $documentManager
    ) {
        $this->couchDbReplicatorService = $couchDbReplicatorService;
        $this->documentManager          = $documentManager;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     *
     * @throws Exception\Recoverable
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        if ($this->couchDbReplicatorService->isReplicationActive($job->getDatabaseName())) {
            throw new Exception\Recoverable();
        }

        $this->documentManager->getCouchDBClient()->deleteDatabase($job->getDatabaseName());
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\DatabaseDeleter;
    }
}
