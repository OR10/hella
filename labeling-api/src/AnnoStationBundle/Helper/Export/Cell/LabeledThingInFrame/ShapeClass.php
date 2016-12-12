<?php

namespace AnnoStationBundle\Helper\Export\Cell\LabeledThingInFrame;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

class ShapeClass extends Export\Cell
{
    /**
     * @var
     */
    private $classValues;

    /**
     * @var
     */
    private $labeledThingInFrameClasses;

    /**
     * Integer constructor.
     *
     * @param $classValues
     * @param $labeledThingInFrameClasses
     *
     * @internal param int $value
     */
    public function __construct($classValues, $labeledThingInFrameClasses)
    {
        $this->classValues                = $classValues;
        $this->labeledThingInFrameClasses = $labeledThingInFrameClasses;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        $values = array_intersect($this->classValues, $this->labeledThingInFrameClasses);

        return reset($values);
    }
}
