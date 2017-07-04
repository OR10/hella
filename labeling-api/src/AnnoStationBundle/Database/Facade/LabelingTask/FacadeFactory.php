<?php

namespace AnnoStationBundle\Database\Facade\LabelingTask;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory
{
    static public function get(
        string $type,
        Facade\LabelingTask $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        switch ($type) {
            case 'taskDatabase':
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