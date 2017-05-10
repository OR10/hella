<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class LabeledThing implements Facade\Factory
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

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
        Facade\LabeledThing $labeledThingFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->labeledThingFacade             = $labeledThingFacade;
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

        return new Facade\LabeledThing($databaseDocumentManager);
    }

    public function getReadOnlyFacade()
    {
        $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->readOnlyDatabase
        );

        return new Facade\LabeledThing($databaseDocumentManager);
    }

    public function getFacade()
    {
        $this->labeledThingFacade;
    }
}