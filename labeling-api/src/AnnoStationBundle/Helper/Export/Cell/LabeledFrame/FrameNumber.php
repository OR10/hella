<?php
namespace AnnoStationBundle\Helper\Export\Cell\LabeledFrame;

use AnnoStationBundle\Helper\Export;
use AppBundle\Model;

class FrameNumber extends Export\Cell
{

    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var Model\LabeledFrame
     */
    private $labeledFrame;

    /**
     * @param Model\LabelingTask $labelingTask
     * @param Model\LabeledFrame $labeledFrame
     */
    public function __construct(Model\LabelingTask $labelingTask, Model\LabeledFrame $labeledFrame)
    {
        $this->labelingTask = $labelingTask;
        $this->labeledFrame = $labeledFrame;
    }

    public function getValue()
    {
        $mapping = $this->labelingTask->getFrameNumberMapping();

        return $mapping[$this->labeledFrame->getFrameIndex()];
    }
}
