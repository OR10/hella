<?php

namespace AnnoStationBundle\Database\Facade\Factory\DefaultDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class LabeledThing implements Facade\Factory
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

    public function getFacade()
    {
        return $this->labeledThingFacade;
    }
}