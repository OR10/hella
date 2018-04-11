<?php

namespace AnnoStationBundle\Database\Facade\TaskTimer;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    public function __construct(
        Facade\TaskTimer $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->readOnlyDatabase               = $readOnlyDatabase;
    }

    public function getFacadeInstance($databaseDocumentManager)
    {
        return new Facade\TaskTimer($databaseDocumentManager);
    }
}
