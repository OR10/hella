<?php

namespace AnnoStationBundle\Service;

use Doctrine\ODM\CouchDB;

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

    public function createDatabase($projectId, $taskId)
    {
        $databaseName = "taskdb-project-$projectId-task-$taskId";
        return $this->documentManager->getCouchDBClient()->createDatabase($databaseName);
    }
}