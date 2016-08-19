<?php
namespace AppBundle\Helper\Export\Cell;

use AppBundle\Helper\Export;
use AppBundle\Model;

class FrameNumber extends Export\Cell
{
    /**
     * @var Model\LabeledThingInFrame
     */
    private $labeledThingInFrame;

    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * Uuid constructor.
     * @param Model\LabelingTask        $labelingTask
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     */
    public function __construct(Model\LabelingTask $labelingTask, Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $this->labeledThingInFrame = $labeledThingInFrame;
        $this->labelingTask        = $labelingTask;
    }

    public function getValue()
    {
        $mapping = $this->labelingTask->getFrameNumberMapping();
        return $mapping[$this->labeledThingInFrame->getFrameIndex()];
    }
}
