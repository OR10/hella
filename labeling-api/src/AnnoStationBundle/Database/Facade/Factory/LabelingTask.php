<?php

namespace AnnoStationBundle\Database\Facade\Factory;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabelingTask implements Facade\Factory
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
     * @var bool
     */
    private $pouchdbFeatureEnabled;

    /**
     * @var string
     */
    private $readOnlyDatabase;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->pouchdbFeatureEnabled          = $pouchdbFeatureEnabled;
        $this->labelingTaskFacade             = $labelingTaskFacade;
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

            return new Facade\LabelingTask($databaseDocumentManager);
        }

        return $this->labelingTaskFacade;
    }

    public function getReadOnlyFacade()
    {
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            return new Facade\LabelingTask($databaseDocumentManager);
        }

        return $this->labelingTaskFacade;
    }
}