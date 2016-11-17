<?php
namespace AppBundle\Helper\Export\Cell\LabeledThingInFrame;

use AppBundle\Helper\Export;
use AppBundle\Model;

class Uuid extends Export\Cell
{
    /**
     * @var Model\LabeledThingInFrame
     */
    private $labeledThingInFrame;

    /**
     * Uuid constructor.
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     */
    public function __construct(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $this->labeledThingInFrame = $labeledThingInFrame;
    }

    public function getValue()
    {
        return $this->labeledThingInFrame->getLabeledThingId();
    }
}
