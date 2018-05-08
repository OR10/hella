<?php

namespace AnnoStationBundle\Database\Facade\LabeledThingGroup;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory extends Facade\Factory\TaskFactoryFluent
{
    public static function get(
        string $type,
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        switch ($type) {
            case self::TASK_DATABASE:
                return new TaskDatabase(
                    $labeledThingGroupFacade,
                    $databaseDocumentManagerFactory,
                    $taskDatabaseCreatorService,
                    $readOnlyDatabase
                );
            default:
                throw new \RuntimeException('Unknown facade type: ' . $type);
        }
    }
}
