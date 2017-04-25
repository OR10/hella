<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledFrameEndCalculationService
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
     * @var bool
     */
    private $pouchdbFeatureEnabled;

    /**
     * @var AppBundleService\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    /**
     * @var TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledFrame $labeledFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        bool $pouchdbFeatureEnabled
    ) {
        $this->labeledFrameFacade             = $labeledFrameFacade;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->pouchdbFeatureEnabled          = $pouchdbFeatureEnabled;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     * @param                    $class
     *
     * @return mixed
     */
    public function getEndOfForClassOfLabeledFrame(Model\LabeledFrame $labeledFrame, $class)
    {
        $task = $this->labelingTaskFacade->find($labeledFrame->getTaskId());

        return $this->findEnd($task, $labeledFrame->getFrameIndex() + 1, $class);
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $index
     * @param                    $class
     *
     * @return mixed
     */
    private function findEnd(Model\LabelingTask $task, $index, $class)
    {
        $labeledFrameFacade = $this->labeledFrameFacade;
        if ($this->pouchdbFeatureEnabled) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->taskDatabaseCreatorService->getDatabaseName(
                    $task->getProjectId(),
                    $task->getId()
                )
            );
            $labeledFrameFacade      = new Facade\LabeledFrame($databaseDocumentManager);
        }

        $nextLabeledFrame = $labeledFrameFacade->getNextLabeledFrameFromFrameIndex(
            $task,
            $index
        );

        if ($nextLabeledFrame === null) {
            return max($task->getFrameNumberMapping());
        }

        if (in_array($class, $nextLabeledFrame->getClasses())) {
            return $this->findEnd($task, $nextLabeledFrame->getFrameIndex() + 1, $class);
        }

        return $nextLabeledFrame->getFrameIndex() - 1;
    }
}