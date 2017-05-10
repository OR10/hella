<?php

namespace AnnoStationBundle\Database\Facade\Factory\DefaultDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledThingInFrame implements Facade\Factory
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

    public function getFacade()
    {
        return $this->labeledThingInFrameFacade;
    }
}