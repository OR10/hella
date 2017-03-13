<?php

namespace AnnoStationBundle\Service;

use Doctrine\ODM\CouchDB;
use AppBundle\Service;

/**
 * Class TaskDatabaseCreator
 * Handles creation of a Task Database in the Couch database and starts the filtered replication
 *
 * @package AnnoStationBundle\Service
 */
class TaskDatabaseCreator
{
    const TASK_DATABASE_NAME_TEMPLATE = 'taskdb-project-%s-task-%s';

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var Service\CouchDbReplicatorService;
     */
    private $couchDbReplicatorService;

    /**
     * LabelingTask constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     * @param Service\CouchDbReplicatorService $couchDbReplicatorService
     */
    public function __construct(CouchDB\DocumentManager $documentManager, Service\CouchDbReplicatorService $couchDbReplicatorService)
    {
        $this->documentManager = $documentManager;
        $this->couchDbReplicatorService = $couchDbReplicatorService;
    }

    /**
     * Creates the database name
     *
     * @param string $projectId
     * @param string $taskId
     *
     * @return string
     */
    private function getDatabaseName($projectId, $taskId)
    {
        return sprintf(TaskDatabaseCreator::TASK_DATABASE_NAME_TEMPLATE, $projectId, $taskId);
    }

    /**
     * Create a Couch database for the given Project and Task ID
     *
     * @param string $projectId
     * @param string $taskId
     *
     * @return CouchDB\DocumentManager
     */
    public function createDatabase($projectId, $taskId)
    {
        $databaseName = $this->getDatabaseName($projectId, $taskId);
        $documentManager = $this->documentManager->getCouchDBClient()->createDatabase($databaseName);
        $this->startReplication($projectId, $taskId);
        return $documentManager;
    }

    /**
     * Start a replication for the given Project and Task ID
     *
     * @param string $projectId
     * @param string $taskId
     */
    private function startReplication($projectId, $taskId)
    {
        $databaseName = $this->getDatabaseName($projectId, $taskId);
        $this->couchDbReplicatorService->addReplication(
            'labeling_api',
            $databaseName,
            true,
            'annostation_labeling_task_replication_filter/filter',
            ['taskId' => $taskId]
        );
    }
}