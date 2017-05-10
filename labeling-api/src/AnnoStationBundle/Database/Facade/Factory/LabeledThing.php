<?php

namespace AnnoStationBundle\Database\Facade\Factory;

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
     * @var bool
     */
    private $pouchdbFeatureEnabled;

    /**
     * @var string
     */
    private $readOnlyDatabase;

    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled,
        $readOnlyDatabase
    ) {
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->pouchdbFeatureEnabled          = $pouchdbFeatureEnabled;
        $this->readOnlyDatabase               = $readOnlyDatabase;
    }

    public function getProjectAndTaskFacade($projectId, $taskId)
    {
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $projectId,
                    $taskId
                )
            );

            return new Facade\LabeledThing($databaseDocumentManager);
        }

        return $this->labeledThingFacade;
    }

    public function getReadOnlyFacade()
    {
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            return new Facade\LabeledThing($databaseDocumentManager);
        }

        return $this->labeledThingFacade;
    }
}