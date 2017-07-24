<?php

namespace AnnoStationBundle\Database\Facade\LabeledThingGroup;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    public function __construct(
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->labeledThingGroupFacade        = $labeledThingGroupFacade;
        $this->readOnlyDatabase               = $readOnlyDatabase;
    }

    public function getFacadeInstance($databaseDocumentManager)
    {
        return new Facade\LabeledThingGroup($databaseDocumentManager);
    }
}
