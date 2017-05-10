<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\Factory;

class LabeledThingInFrames
{
    /**
     * @var Factory\LabeledThingInFrame
     */
    private $labeledThingInFrameFacadeFactory;

    public function __construct(
        Factory\LabeledThingInFrame $labeledThingInFrameFacadeFactory
    ) {

        $this->labeledThingInFrameFacadeFactory = $labeledThingInFrameFacadeFactory;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        $labeledThingInFrames = $labeledThingInFrameFacade->getLabeledThingsInFrame($labelingTask);

        $labeledThingInFrameFacade->delete($labeledThingInFrames);
    }
}
