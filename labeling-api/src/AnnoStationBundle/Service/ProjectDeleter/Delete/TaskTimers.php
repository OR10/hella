<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AppBundle\Service as AppBundleService;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;

class TaskTimers
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

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled
    ) {
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->pouchdbFeatureEnabled          = $pouchdbFeatureEnabled;
    }

    public function delete(Model\LabelingTask $labelingTask)
    {
        $labelingTaskFacade = $this->labelingTaskFacade;
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager   = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $labelingTask->getProjectId(),
                    $labelingTask->getId()
                )
            );
            $labelingTaskFacade = new Facade\LabelingTask($databaseDocumentManager);
        }

        $taskTimers = $labelingTaskFacade->getTaskTimerByTask($labelingTask);
        foreach ($taskTimers as $taskTimer) {
            $labelingTaskFacade->deleteTimer($taskTimer);
        }
    }
}
