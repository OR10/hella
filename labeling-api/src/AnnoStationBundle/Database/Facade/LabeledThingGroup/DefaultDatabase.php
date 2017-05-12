<?php

namespace AnnoStationBundle\Database\Facade\LabeledThingGroup;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;

class DefaultDatabase extends Factory\Cache implements FacadeInterface
{
    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    public function __construct(Facade\LabeledThingGroup $labeledThingGroupFacade)
    {
        $this->labeledThingGroupFacade = $labeledThingGroupFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        return $this->labeledThingGroupFacade;
    }

    public function getReadOnlyFacade()
    {
        return $this->labeledThingGroupFacade;
    }
}