<?php
namespace AnnoStationBundle\Helper\Export\Cell\LabeledFrame;

use AnnoStationBundle\Helper\Export;
use AppBundle\Model;

class Uuid extends Export\Cell
{
    /**
     * @var Model\LabeledFrame
     */
    private $labeledFrame;

    /**
     * Uuid constructor.
     * @param Model\LabeledFrame $labeledFrame
     */
    public function __construct(Model\LabeledFrame $labeledFrame)
    {
        $this->labeledFrame = $labeledFrame;
    }

    public function getValue()
    {
        return $this->labeledFrame->getId();
    }
}
