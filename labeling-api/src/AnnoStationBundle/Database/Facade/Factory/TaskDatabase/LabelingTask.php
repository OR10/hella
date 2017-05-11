<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabelingTask extends Facade\Factory
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

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
        Facade\LabelingTask $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->labelingTaskFacade             = $labelingTaskFacade;
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

            $this->addFacadeCache($databaseName, new Facade\LabelingTask($databaseDocumentManager));
        }

        return $this->getFacadeCache($databaseName);
    }

    public function getReadOnlyFacade()
    {
        if (!$this->isInFacadeCache($this->readOnlyDatabase)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            $this->addFacadeCache($this->readOnlyDatabase, new Facade\LabelingTask($databaseDocumentManager));
        }

        return $this->getFacadeCache($this->readOnlyDatabase);
    }
}