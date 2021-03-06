<?php

namespace AnnoStationBundle\Helper\Export\ShapeColumns;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

class Rectangle extends Export\ShapeColumns
{
    public function __construct()
    {
    }

    public function create()
    {
        return array(
            new Column\Rectangle(Column\Rectangle::TYPE_X),
            new Column\Rectangle(Column\Rectangle::TYPE_Y),
            new Column\Rectangle(Column\Rectangle::TYPE_WIDTH),
            new Column\Rectangle(Column\Rectangle::TYPE_HEIGHT),
        );
    }
}
