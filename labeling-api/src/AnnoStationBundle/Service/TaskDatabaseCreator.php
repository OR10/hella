<?php

namespace AnnoStationBundle\Service;

use Doctrine\ODM\CouchDB;

/**
 * Class TaskDatabaseCreator
 * Handles creation of a Task Database in the Couch database and starts the filtered replication
 *
 * @package AnnoStationBundle\Service
 */
class TaskDatabaseCreator
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * LabelingTask constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * Create a Couch database for the given Project and Task ID
     *
     * @param string $projectId
     * @param string $taskId
     */
    public function createDatabase($projectId, $taskId)
    {
        $databaseName = "taskdb-project-$projectId-task-$taskId";
        return $this->documentManager->getCouchDBClient()->createDatabase($databaseName);
    }
}