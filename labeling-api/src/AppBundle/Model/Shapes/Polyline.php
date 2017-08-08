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
            throw new \RuntimeException(
                sprintf('Polyline shape with id "%s" is invalid', isset($shape['id']) ? $shape['id'] : '')
            );
        }

        return new Polyline($shape['id'], $shape['points']);
    }


    public function getType()
    {
        return 'polyline';
    }
}
