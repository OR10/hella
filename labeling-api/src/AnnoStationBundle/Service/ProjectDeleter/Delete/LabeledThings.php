<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\Factory;

class LabeledThings
{
    /**
     * @var Factory
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var Factory
     */
    private $labeledThingFacadeFactory;

    public function __construct(
        Factory $labelingTaskFacadeFactory,
        Factory $labeledThingFacadeFactory
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
