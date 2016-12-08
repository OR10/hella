<?php

namespace AnnoStationBundle\Helper\Export\Cell;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

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
