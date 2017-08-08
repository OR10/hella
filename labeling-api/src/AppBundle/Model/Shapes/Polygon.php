<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Polygon extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    private $points = [];

    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id']) || !isset($shape['points']) || !is_array($shape['points'])) {
            throw new \RuntimeException(
                sprintf('Polygon shape with id "%s" is invalid', isset($shape['id']) ? $shape['id'] : '')
            );
        }

        return new Polygon($shape['id'], $shape['points']);
    }

    /**
     * @param string $id
     * @param array  $points
     */
    public function __construct($id, array $points)
    {
        if (empty($points)) {
            throw new \RuntimeException('Empty point list for polygons is not allowed');
        }

        $this->id     = (string) $id;
        $this->points = array_map(
            function($point) {
                if (!isset($point['x']) || !isset($point['y'])) {
                    throw new \RuntimeException('Invalid point in polygon shape');
                }

                return ['x' => $point['x'], 'y' => $point['y']];
            },
            $points
        );
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return 'polygon';
    }

    public function getBoundingBox()
    {
        $left = $right  = $this->points[0]['x'];
        $top  = $bottom = $this->points[0]['y'];

        foreach ($this->points as $point) {
            $left   = min($left, $point['x']);
            $top    = min($top, $point['y']);
            $right  = max($right, $point['x']);
            $bottom = max($bottom, $point['y']);
        }

        return new BoundingBox($left, $top, $right, $bottom);
    }

    public function toArray()
    {
        return [
            'id'     => $this->id,
            'type'   => $this->getType(),
            'points' => $this->points,
        ];
    }

    /**
     * @return array
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
