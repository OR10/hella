<?php

namespace AnnoStationBundle\Database\Facade\LabeledThing;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->readOnlyDatabase               = $readOnlyDatabase;
    }

    public function getFacadeInstance($databaseDocumentManager)
    {
        return new Facade\LabeledThing($databaseDocumentManager);
    }
}
