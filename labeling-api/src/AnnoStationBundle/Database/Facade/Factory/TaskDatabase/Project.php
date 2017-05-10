<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class Project implements Facade\Factory
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
        $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->taskDatabaseCreatorService->getDatabaseName(
                $projectId,
                $taskId
            )
        );

        return new Facade\Project($databaseDocumentManager);
    }

    public function getReadOnlyFacade()
    {
        $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->readOnlyDatabase
        );

        return new Facade\Project($databaseDocumentManager);
    }

    public function getFacade()
    {
        $this->projectFacade;
    }
}