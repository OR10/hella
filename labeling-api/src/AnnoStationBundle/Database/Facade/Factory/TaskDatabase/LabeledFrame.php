<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledFrame implements Facade\Factory
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

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
        Facade\LabeledFrame $labeledFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->readOnlyDatabase               = $readOnlyDatabase;
        $this->labeledFrameFacade             = $labeledFrameFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->taskDatabaseCreatorService->getDatabaseName(
                $projectId,
                $taskId
            )
        );

        return new Facade\LabeledFrame($databaseDocumentManager);
    }

    public function getReadOnlyFacade()
    {
        $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->readOnlyDatabase
        );

        return new Facade\LabeledFrame($databaseDocumentManager);
    }

    public function getFacade()
    {
        $this->labeledFrameFacade;
    }
}