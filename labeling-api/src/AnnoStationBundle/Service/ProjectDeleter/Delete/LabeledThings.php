<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AppBundle\Service as AppBundleService;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;

class LabeledThings
{
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
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled
    ) {
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
        $labeledThingFacade = $this->labeledThingFacade;
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager   = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $labelingTask->getProjectId(),
                    $labelingTask->getId()
                )
            );
            $labeledThingFacade = new Facade\LabeledThing($databaseDocumentManager);
        }

        $labeledThings = $labeledThingFacade->findByTaskId($labelingTask);
        foreach ($labeledThings as $labeledThing) {
            $labeledThingFacade->delete($labeledThing);
        }
    }
}
