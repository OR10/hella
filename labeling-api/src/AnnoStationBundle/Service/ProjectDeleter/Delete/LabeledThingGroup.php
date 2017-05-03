<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AppBundle\Service as AppBundleService;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;

class LabeledThingGroup
{
    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

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
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled
    ) {
        $this->labeledThingGroupFacade        = $labeledThingGroupFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->pouchdbFeatureEnabled          = $pouchdbFeatureEnabled;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labeledThingGroupFacade = $this->labeledThingGroupFacade;
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $labelingTask->getProjectId(),
                    $labelingTask->getId()
                )
            );
            $labeledThingGroupFacade = new Facade\LabeledThingGroup($databaseDocumentManager);
        }

        $labeledThingGroupIds = $labeledThingGroupFacade->getLabeledThingGroupIdsByTask($labelingTask);
        foreach ($labeledThingGroupIds as $labeledThingGroupId) {
            $labeledThingGroup = $labeledThingGroupFacade->find($labeledThingGroupId);
            $labeledThingGroupFacade->delete($labeledThingGroup);
        }
    }
}
