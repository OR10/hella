<?php

namespace AnnoStationBundle\Database\Facade\LabeledFrame;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    public function __construct(
        Facade\LabeledFrame $labeledFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->readOnlyDatabase               = $readOnlyDatabase;
        $this->labeledFrameFacade             = $labeledFrameFacade;
    }

    public function getFacadeInstance($databaseDocumentManager)
    {
        return new Facade\LabeledFrame($databaseDocumentManager);
    }
}
