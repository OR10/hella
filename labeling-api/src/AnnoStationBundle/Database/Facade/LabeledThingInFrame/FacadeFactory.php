<?php

namespace AnnoStationBundle\Database\Facade\LabeledThingInFrame;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory
{
    public static function get(
        string $type,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        switch ($type) {
            case 'taskDatabase':
                return new TaskDatabase(
                    $labeledThingInFrameFacade,
                    $databaseDocumentManagerFactory,
                    $taskDatabaseCreatorService,
                    $readOnlyDatabase
                );
            default:
                throw new \RuntimeException('Unknown facade type: ' . $type);
        }
    }
}
