<?php

namespace AnnoStationBundle\Database\Facade\LabeledFrame;

use AnnoStationBundle\Database\Facade;

class DefaultDatabase implements FacadeInterface
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