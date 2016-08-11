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
     * @param Column $column
     * @param int    $value
     */
    public function __construct(Column $column, $value)
    {
        parent::__construct($column);

        $this->value = $value;
    }

    public function getValue()
    {
        return (string)(int)$this->value;
    }
}