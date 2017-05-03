<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AppBundle\Service as AppBundleService;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;

class LabeledThings
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var AppBundleService\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var bool
     */
    private $pouchdbFeatureEnabled;

    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabelingTask $labelingTaskFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled
    ) {
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->pouchdbFeatureEnabled          = $pouchdbFeatureEnabled;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labelingTaskFacade = $this->labelingTaskFacade;
        $labeledThingFacade = $this->labeledThingFacade;
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager   = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $labelingTask->getProjectId(),
                    $labelingTask->getId()
                )
            );
            $labelingTaskFacade = new Facade\LabelingTask($databaseDocumentManager);
            $labeledThingFacade = new Facade\LabeledThing($databaseDocumentManager);
        }

        $labeledThings = $labelingTaskFacade->getLabeledThings($labelingTask);
        foreach ($labeledThings as $labeledThing) {
            $labeledThingFacade->delete($labeledThing);
        }
    }
}
