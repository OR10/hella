<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\LabelingTask;
use AnnoStationBundle\Database\Facade\LabeledThing;

class LabeledThings
{
    /**
     * @var LabelingTask\FacadeInterface
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    public function __construct(
        LabelingTask\FacadeInterface $labelingTaskFacadeFactory,
        LabeledThing\FacadeInterface $labeledThingFacadeFactory
    ) {
        $this->labelingTaskFacadeFactory = $labelingTaskFacadeFactory;
        $this->labeledThingFacadeFactory = $labeledThingFacadeFactory;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labelingTaskFacade = $this->labelingTaskFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        $labeledThings = $labelingTaskFacade->getLabeledThings($labelingTask);
        foreach ($labeledThings as $labeledThing) {
            $labeledThingFacade->delete($labeledThing);
        }
    }
}
