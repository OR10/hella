<?php

namespace AppBundle\Helper\Export\ShapeColumns;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Column;

class Pedestrian extends Export\ShapeColumns
{
    public function __construct()
    {
    }

    public function create()
    {
        return array(
            new Column\Pedestrian(Column\Pedestrian::TYPE_X),
            new Column\Pedestrian(Column\Pedestrian::TYPE_Y),
            new Column\Pedestrian(Column\Pedestrian::TYPE_WIDTH),
            new Column\Pedestrian(Column\Pedestrian::TYPE_HEIGHT),
        );
    }
}