<?php

namespace AppBundle\Model\Shapes;

class Polyline extends Polygon
{
    public function __construct($id, array $points)
    {
        parent::__construct($id, $points);
    }

    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id']) || !isset($shape['points']) || !is_array($shape['points'])) {
            throw new \RuntimeException('Invalid polygon shape');
        }

        return new Polyline($shape['id'], $shape['points']);
    }


    public function getType()
    {
        return 'polyline';
    }
}
