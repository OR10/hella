<?php
namespace AnnoStationBundle\Database\Facade\Factory;

use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

abstract class TaskDatabase extends Cache
{
    /**
     * @var AppBundleService\DatabaseDocumentManagerFactory
     */
    protected $databaseDocumentManagerFactory;

    /**
     * @var Service\TaskDatabaseCreator
     */
    protected $taskDatabaseCreatorService;

    /**
     * @var string
     */
    protected $readOnlyDatabase;

    abstract public function getFacadeInstance($databaseDocumentManager);

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        $databaseName = $this->taskDatabaseCreatorService->getDatabaseName(
            $projectId,
            $taskId
        );
        if (!$this->isInFacadeCache($databaseName)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $databaseName
            );

            $this->addFacadeCache($databaseName, $this->getFacadeInstance($databaseDocumentManager));
        }

        return $this->getFacadeCache($databaseName);
    }

    public function getReadOnlyFacade()
    {
        if (!$this->isInFacadeCache($this->readOnlyDatabase)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            $this->addFacadeCache($this->readOnlyDatabase, $this->getFacadeInstance($databaseDocumentManager));
        }

        return $this->getFacadeCache($this->readOnlyDatabase);
    }
}