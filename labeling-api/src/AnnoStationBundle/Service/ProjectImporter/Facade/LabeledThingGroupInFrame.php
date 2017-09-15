<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\LabeledThingGroupInFrame as LabeledThingGroupInFrameFacadeFactory;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;

class LabeledThingGroupInFrame
{
    /**
     * @var LabeledThingGroupInFrameFacadeFactory\FacadeInterface
     */
    private $labeledThingGroupInFrameFacadeFactory;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * LabeledThing constructor.
     *
     * @param Facade\LabelingTask                                   $labelingTaskFacade
     * @param LabeledThingGroupInFrameFacadeFactory\FacadeInterface $labeledThingGroupInFrameFacadeFactory
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledThingGroupInFrameFacadeFactory\FacadeInterface $labeledThingGroupInFrameFacadeFactory
    )
    {
        $this->labeledThingGroupInFrameFacadeFactory = $labeledThingGroupInFrameFacadeFactory;
        $this->labelingTaskFacade                    = $labelingTaskFacade;
    }

    /**
     * @param Model\LabeledThingGroupInFrame $labeledThingGroupInFrame
     *
     * @return Model\LabeledThingGroupInFrame
     */
    public function save(Model\LabeledThingGroupInFrame $labeledThingGroupInFrame)
    {
        $task                           = $this->labelingTaskFacade->find($labeledThingGroupInFrame->getTaskId());
        $labeledThingGroupInFrameFacade = $this->labeledThingGroupInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        return $labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame);
    }
}
