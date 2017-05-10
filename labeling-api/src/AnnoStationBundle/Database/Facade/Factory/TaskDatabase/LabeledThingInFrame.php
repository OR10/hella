<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledThingInFrame implements Facade\Factory
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

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
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
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

        return new Facade\LabeledThingInFrame($databaseDocumentManager);
    }

    public function getReadOnlyFacade()
    {
        $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->readOnlyDatabase
        );

        return new Facade\LabeledThingInFrame($databaseDocumentManager);
    }

    public function getFacade()
    {
        $this->labeledThingInFrameFacade;
    }
}