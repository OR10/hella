<?php

namespace AnnoStationBundle\Database\Facade\Factory\DefaultDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledThingGroup extends Facade\Factory
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