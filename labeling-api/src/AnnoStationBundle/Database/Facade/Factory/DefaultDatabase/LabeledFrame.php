<?php

namespace AnnoStationBundle\Database\Facade\Factory\DefaultDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledFrame extends Facade\Factory
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    public function __construct(Facade\LabeledFrame $labeledFrameFacade)
    {
        $this->labeledFrameFacade = $labeledFrameFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        return $this->labeledFrameFacade;
    }

    public function getReadOnlyFacade()
    {

        return $this->labeledFrameFacade;
    }
}