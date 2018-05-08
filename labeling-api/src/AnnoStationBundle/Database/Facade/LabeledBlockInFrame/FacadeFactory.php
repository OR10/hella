<?php

namespace AnnoStationBundle\Database\Facade\LabeledBlockInFrame;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory
{

    /**
     * @param string $type
     * @param Facade\LabeledBlockInFrame $labeledThingInFrameFacade
     * @param AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Service\TaskDatabaseCreator $taskDatabaseCreatorService
     * @param $readOnlyDatabase
     * @return TaskDatabase
     */
    public static function get(
        string $type,
        Facade\LabeledBlockInFrame $labeledThingInFrameFacade,
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
