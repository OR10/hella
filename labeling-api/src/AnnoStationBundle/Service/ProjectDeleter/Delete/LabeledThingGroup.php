<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\Factory;

class LabeledThingGroup
{
    /**
     * @var Factory\LabeledThingGroup
     */
    private $labeledThingGroupFacadeFactory;

    public function __construct(Factory\LabeledThingGroup $labeledThingGroupFacadeFactory)
    {
        $this->labeledThingGroupFacadeFactory = $labeledThingGroupFacadeFactory;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labeledThingGroupFacade = $this->labeledThingGroupFacadeFactory->getProjectAndTaskFacade(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        $labeledThingGroupIds = $labeledThingGroupFacade->getLabeledThingGroupIdsByTask($labelingTask);
        foreach ($labeledThingGroupIds as $labeledThingGroupId) {
            $labeledThingGroup = $labeledThingGroupFacade->find($labeledThingGroupId);
            $labeledThingGroupFacade->delete($labeledThingGroup);
        }
    }
}
