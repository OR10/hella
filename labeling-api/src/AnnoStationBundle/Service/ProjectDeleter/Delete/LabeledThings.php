<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\Factory;

class LabeledThings
{
    /**
     * @var Factory\LabelingTask
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var Factory\LabeledThing
     */
    private $labeledThingFacadeFactory;

    public function __construct(
        Factory\LabelingTask $labelingTaskFacadeFactory,
        Factory\LabeledThing $labeledThingFacadeFactory
    ) {
        $this->labelingTaskFacadeFactory = $labelingTaskFacadeFactory;
        $this->labeledThingFacadeFactory = $labeledThingFacadeFactory;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labelingTaskFacade = $this->labelingTaskFacadeFactory->getProjectAndTaskFacade(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );
        $labeledThingFacade = $this->labeledThingFacadeFactory->getProjectAndTaskFacade(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        $labeledThings = $labelingTaskFacade->getLabeledThings($labelingTask);
        foreach ($labeledThings as $labeledThing) {
            $labeledThingFacade->delete($labeledThing);
        }
    }
}
