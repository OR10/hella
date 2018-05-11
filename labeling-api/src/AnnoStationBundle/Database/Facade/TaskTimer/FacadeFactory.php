<?php

namespace AnnoStationBundle\Database\Facade\TaskTimer;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory extends Facade\Factory\TaskFactoryFluent
{

    /**
     * @param string                                          $type
     * @param Facade\TaskTimer                                $labelingTaskFacade
     * @param AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Service\TaskDatabaseCreator                     $taskDatabaseCreatorService
     * @param string                                          $readOnlyDatabase
     * @return TaskDatabase
     */
    public static function get(
        string $type,
        Facade\TaskTimer $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        string $readOnlyDatabase
    ) {
        switch ($type) {
            case self::TASK_DATABASE:
                return new TaskDatabase(
                    $labelingTaskFacade,
                    $databaseDocumentManagerFactory,
                    $taskDatabaseCreatorService,
                    $readOnlyDatabase
                );
            default:
                throw new \RuntimeException('Unknown facade type: ' . $type);
        }
    }
}
