<?php

namespace AppBundle\Helper\Export\Cell;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Column;

class DefaultValue extends Export\Cell
{
    /**
     * @var Column
     */
    private $column;

    /**
     * @param Column $column
     */
    public function __construct(Column $column)
    {
        $this->column = $column;
    }

    public function getValue()
    {
        return $this->column->getDefaultValue();
    }
}
