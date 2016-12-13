<?php

namespace AnnoStationBundle\Helper\Export\ShapeColumns;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

class Polygon extends Export\ShapeColumns
{
    public function __construct()
    {
    }

    public function create()
    {
        return array(
            new Column\Polygon()
        );
    }
}
