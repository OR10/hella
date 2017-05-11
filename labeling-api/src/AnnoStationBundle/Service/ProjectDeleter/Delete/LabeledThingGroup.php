<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\LabeledThingGroup as LabeledThingGroupFacadeFactory;

class LabeledThingGroup
{
    /**
     * @var LabeledThingGroupFacadeFactory\FacadeInterface
     */
    private $labeledThingGroupFacadeFactory;

    public function __construct(LabeledThingGroupFacadeFactory\FacadeInterface $labeledThingGroupFacadeFactory)
    {
        $this->labeledThingGroupFacadeFactory = $labeledThingGroupFacadeFactory;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labeledThingGroupFacade = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
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
