<?php

namespace AnnoStationBundle\Database\Facade\LabeledThingInFrame;

use AnnoStationBundle\Database\Facade;

class DefaultDatabase implements FacadeInterface
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade)
    {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        return $this->labeledThingInFrameFacade;
    }

    public function getReadOnlyFacade()
    {
        return $this->labeledThingInFrameFacade;
    }
}