<?php

namespace AnnoStationBundle\Database\Facade\LabeledThing;

use AnnoStationBundle\Database\Facade;

class DefaultDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    public function __construct(Facade\LabeledThing $labeledThingFacade)
    {
        $this->labeledThingFacade = $labeledThingFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        return $this->labeledThingFacade;
    }

    public function getReadOnlyFacade()
    {

        return $this->labeledThingFacade;
    }
}