<?php

namespace AnnoStationBundle\Database\Facade\LabeledThingGroupInFrame;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabeledThingGroupInFrame
     */
    private $labeledThingGroupInFrameFacade;

    public function __construct(
        Facade\LabeledThingGroupInFrame $labeledThingGroupInFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->labeledThingGroupInFrameFacade = $labeledThingGroupInFrameFacade;
        $this->readOnlyDatabase               = $readOnlyDatabase;
    }

    public function getFacadeInstance($databaseDocumentManager)
    {
        return new Facade\LabeledThingGroupInFrame($databaseDocumentManager);
    }
}
