<?php

namespace AnnoStationBundle\Service;

use Doctrine\ODM\CouchDB;
use AppBundle\Service;
use AppBundle\Model;

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
     * @var bool
     */
    private $pouchDbFeatureEnabled;

    /**
     * LabelingTask constructor.
     *
     * @param CouchDB\DocumentManager          $documentManager
     * @param Service\CouchDbReplicatorService $couchDbReplicatorService
     * @param                                  $pouchDbFeatureEnabled
     */
    public function __construct(
        CouchDB\DocumentManager $documentManager,
        Service\CouchDbReplicatorService $couchDbReplicatorService,
        $pouchDbFeatureEnabled
    ) {
        $this->documentManager          = $documentManager;
        $this->couchDbReplicatorService = $couchDbReplicatorService;
        $this->pouchDbFeatureEnabled    = $pouchDbFeatureEnabled;
    }

    /**
     * Creates the database name
     *
     * @param string $projectId
     * @param string $taskId
     *
     * @return string
     */
    public function getDatabaseName($projectId, $taskId)
    {
        return sprintf(TaskDatabaseCreator::TASK_DATABASE_NAME_TEMPLATE, $projectId, $taskId);
    }

    /**
     * Create a Couch database for the given Project and Task ID
     *
     * @param Model\Project      $project
     * @param Model\LabelingTask $task
     *
     * @return CouchDB\DocumentManager
     */
    public function createDatabase(Model\Project $project, Model\LabelingTask $task)
    {
        if ($this->pouchDbFeatureEnabled) {
            $databaseName    = $this->getDatabaseName($project->getId(), $task->getId());
            $documentManager = $this->documentManager->getCouchDBClient()->createDatabase($databaseName);

            return $documentManager;
        }
    }
}