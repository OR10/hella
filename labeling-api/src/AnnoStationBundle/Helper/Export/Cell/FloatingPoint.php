<?php

namespace AnnoStationBundle\Helper\Export\Cell;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

class FloatingPoint extends Export\Cell
{
    /**
     * @var float
     */
    private $value;

    /**
     * @var int
     */
    private $decimals;

    /**
     * Integer constructor.
     *
     * @param float $value
     * @param int   $decimals
     */
    public function __construct($value, $decimals = 8)
    {
        $this->value = $value;
        $this->decimals = $decimals;
    }

    /**
     * @return string
     */
    public function getValue()
    {
        return (string)round($this->value, $this->decimals);
    }
}
