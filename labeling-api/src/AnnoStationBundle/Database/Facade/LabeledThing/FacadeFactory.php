<?php

namespace AnnoStationBundle\Database\Facade\LabeledThing;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory
{
    static public function get(
        string $type,
        Facade\LabeledThing $labeledThingFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        switch ($type) {
            case 'defaultDatabase':
                return new DefaultDatabase($labeledThingFacade);
            case 'taskDatabase':
                return new TaskDatabase(
                    $labeledThingFacade,
                    $databaseDocumentManagerFactory,
                    $taskDatabaseCreatorService,
                    $readOnlyDatabase
                );
            default:
                throw new \RuntimeException('Unknown facade type: ' . $type);
        }
    }
}