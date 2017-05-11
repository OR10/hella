<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledThingGroup extends Facade\Factory
{
    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

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
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->labeledThingGroupFacade        = $labeledThingGroupFacade;
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

            $this->addFacadeCache($databaseName, new Facade\LabeledThingGroup($databaseDocumentManager));
        }

        return $this->getFacadeCache($databaseName);
    }

    public function getReadOnlyFacade()
    {
        if (!$this->isInFacadeCache($this->readOnlyDatabase)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            $this->addFacadeCache($this->readOnlyDatabase, new Facade\LabeledThingGroup($databaseDocumentManager));
        }

        return $this->getFacadeCache($this->readOnlyDatabase);
    }
}