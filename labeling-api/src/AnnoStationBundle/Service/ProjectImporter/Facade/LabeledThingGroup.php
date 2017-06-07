<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\LabeledThingGroup as LabeledThingGroupFacadeFactory;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;

class LabeledThingGroup
{
    /**
     * @var LabeledThingGroupFacadeFactory\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * LabeledThing constructor.
     *
     * @param Facade\LabelingTask                            $labelingTaskFacade
     * @param LabeledThingGroupFacadeFactory\FacadeInterface $labeledThingGroupFacadeFactory
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledThingGroupFacadeFactory\FacadeInterface $labeledThingGroupFacadeFactory
    ) {
        $this->labeledThingFacadeFactory = $labeledThingGroupFacadeFactory;
        $this->labelingTaskFacade        = $labelingTaskFacade;
    }

    /**
     * @param Model\LabeledThingGroup $labeledThingGroup
     *
     * @return Model\LabeledThingGroup
     */
    public function save(Model\LabeledThingGroup $labeledThingGroup)
    {
        $task                    = $this->labelingTaskFacade->find($labeledThingGroup->getTaskId());
        $labeledThingGroupFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        return $labeledThingGroupFacade->save($labeledThingGroup);
    }

    /**
     * @param AppBundleModel\LabelingTask $task
     * @param                             $originalId
     *
     * @return Model\LabeledThingGroup|null
     */
    public function getLabeledThingGroupByTaskIdAndOriginalId(AppBundleModel\LabelingTask $task, $originalId)
    {
        $labeledThingGroupFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        return $labeledThingGroupFacade->getLabeledThingGroupByTaskIdAndOriginalId($task, $originalId);
    }
}