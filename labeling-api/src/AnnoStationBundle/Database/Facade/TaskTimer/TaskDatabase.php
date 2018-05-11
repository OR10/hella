<?php

namespace AnnoStationBundle\Database\Facade\TaskTimer;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;
use Doctrine\ODM\CouchDB\DocumentManager;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * TaskDatabase constructor.
     * @param Facade\TaskTimer                                $labelingTaskFacade
     * @param AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Service\TaskDatabaseCreator                     $taskDatabaseCreatorService
     * @param string                                          $readOnlyDatabase
     */
    public function __construct(
        Facade\TaskTimer $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        string $readOnlyDatabase
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
