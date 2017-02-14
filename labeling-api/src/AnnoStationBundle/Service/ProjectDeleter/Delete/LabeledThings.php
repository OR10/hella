<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class LabeledThings
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    public function __construct(Facade\LabeledThing $labeledThingFacade, Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->labeledThingFacade = $labeledThingFacade;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labeledThings = $this->labelingTaskFacade->getLabeledThings($labelingTask);
        foreach ($labeledThings as $labeledThing) {
            $this->labeledThingFacade->delete($labeledThing);
        }
    }
}
