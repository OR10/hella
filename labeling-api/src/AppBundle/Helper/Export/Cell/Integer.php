<?php

namespace AppBundle\Helper\Export\Cell;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Column;

class Integer extends Export\Cell
{
    /**
     * @var int
     */
    private $value;

    /**
     * Integer constructor.
     *
     * @param int    $value
     */
    public function __construct($value)
    {
        $this->value = $value;
    }

    public function getValue()
    {
        return (string)(int)$this->value;
    }
}