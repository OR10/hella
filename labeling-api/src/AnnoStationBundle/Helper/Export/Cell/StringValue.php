<?php

namespace AnnoStationBundle\Helper\Export\Cell;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

class StringValue extends Export\Cell
{
    /**
     * @var int
     */
    private $value;

    public function __construct($value)
    {
        $this->value = $value;
    }

    public function getValue()
    {
        return (string) $this->value;
    }
}
