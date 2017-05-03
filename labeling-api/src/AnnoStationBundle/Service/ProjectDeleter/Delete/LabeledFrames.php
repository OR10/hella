<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AppBundle\Service as AppBundleService;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;

class LabeledFrames
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Facade\LabelingTask
     */

    private $labelingTaskFacade;
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
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledFrame $labeledFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $pouchdbFeatureEnabled
    ) {
        $this->labeledFrameFacade             = $labeledFrameFacade;
        $this->labelingTaskFacade             = $labelingTaskFacade;
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
        $labeledFrameFacade = $this->labeledFrameFacade;
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $labelingTask->getProjectId(),
                    $labelingTask->getId()
                )
            );
            $labelingTaskFacade = new Facade\LabelingTask($databaseDocumentManager);
            $labeledFrameFacade = new Facade\LabeledFrame($databaseDocumentManager);

        }
        $labeledFrames = $labelingTaskFacade->getLabeledFrames($labelingTask);
        foreach ($labeledFrames as $labeledFrame) {
            $labeledFrameFacade->delete($labeledFrame);
        }
    }
}
