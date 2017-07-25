<?php

namespace AnnoStationBundle\Database\Facade\Project;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory
{
    public static function get(
        string $type,
        Facade\Project $projectFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        switch ($type) {
            case 'taskDatabase':
                return new TaskDatabase(
                    $projectFacade,
                    $databaseDocumentManagerFactory,
                    $taskDatabaseCreatorService,
                    $readOnlyDatabase
                );
            default:
                throw new \RuntimeException('Unknown facade type: ' . $type);
        }
    }
}
