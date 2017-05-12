<?php

namespace AnnoStationBundle\Database\Facade\Project;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\Cache implements FacadeInterface
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var AppBundleService\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var string
     */
    private $readOnlyDatabase;

    public function __construct(
        Facade\Project $projectFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->projectFacade                  = $projectFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->readOnlyDatabase               = $readOnlyDatabase;
    }

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

            $this->addFacadeCache($databaseName, new Facade\Project($databaseDocumentManager));
        }

        return $this->getFacadeCache($databaseName);
    }

    public function getReadOnlyFacade()
    {
        if (!$this->isInFacadeCache($this->readOnlyDatabase)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            $this->addFacadeCache($this->readOnlyDatabase, new Facade\Project($databaseDocumentManager));
        }

        return $this->getFacadeCache($this->readOnlyDatabase);
    }
}