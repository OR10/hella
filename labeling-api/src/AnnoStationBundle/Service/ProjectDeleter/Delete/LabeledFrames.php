<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class LabeledFrames
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTask;

    public function __construct(Facade\LabelingTask $labelingTask, Facade\LabeledFrame $labeledFrameFacade)
    {
        $this->labeledFrameFacade = $labeledFrameFacade;
        $this->labelingTask       = $labelingTask;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labeledFrames = $this->labelingTask->getLabeledFrames($labelingTask);
        foreach ($labeledFrames as $labeledFrame) {
            $this->labeledFrameFacade->delete($labeledFrame);
        }
    }
}
