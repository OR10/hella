<?php

namespace AnnoStationBundle\Database\Facade\LabeledFrame;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class FacadeFactory extends  Facade\Factory\TaskFactoryFluent
{
    public static function get(
        string $type,
        Facade\LabeledFrame $labeledFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        switch ($type) {
            case self::TASK_DATABASE:
                return new TaskDatabase(
                    $labeledFrameFacade,
                    $databaseDocumentManagerFactory,
                    $taskDatabaseCreatorService,
                    $readOnlyDatabase
                );
            default:
                throw new \RuntimeException('Unknown facade type: ' . $type);
        }
    }
}
