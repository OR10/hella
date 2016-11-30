<?php

namespace AppBundle\Helper\Export\Cell\LabeledFrame;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Column;

class ShapeClass extends Export\Cell
{
    /**
     * @var
     */
    private $classValues;

    /**
     * @var
     */
    private $labeledFrameClasses;

    /**
     * Integer constructor.
     *
     * @param $classValues
     * @param $labeledFrameClasses
     *
     * @internal param int $value
     */
    public function __construct($classValues, $labeledFrameClasses)
    {
        $this->classValues         = $classValues;
        $this->labeledFrameClasses = $labeledFrameClasses;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        $values = array_intersect($this->classValues, $this->labeledFrameClasses);

        return reset($values);
    }
}