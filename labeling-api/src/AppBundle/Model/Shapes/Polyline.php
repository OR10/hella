<?php

namespace AppBundle\Model\Shapes;

class Polyline extends Polygon
{
    public function __construct($id, array $points)
    {
        parent::__construct($id, $points);
    }
}