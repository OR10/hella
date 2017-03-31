<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Point extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    /**
     * @var array
     */
    private $point = [];

    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id']) || !isset($shape['point']) || !isset($shape['point']['x']) ||
            !isset($shape['point']['y'])
        ) {
            throw new \RuntimeException('Invalid point shape');
        }

        return new Point($shape['id'], $shape['point']);
    }

    /**
     * @param string $id
     * @param array  $point
     */
    public function __construct($id, array $point)
    {
        if (!isset($point['x']) || !isset($point['y'])) {
            throw new \RuntimeException('Missing x or y point');
        }

        $this->id    = (string) $id;
        $this->point = [
            'x' => $point['x'],
            'y' => $point['y'],
        ];
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return 'point';
    }

    public function getBoundingBox()
    {
        return new BoundingBox($this->point['x'], $this->point['y'], $this->point['x'], $this->point['y']);
    }

    public function toArray()
    {
        return [
            'id'    => $this->id,
            'type'  => $this->getType(),
            'point' => $this->point,
        ];
    }

    /**
     * @return array
     */
    public function getPoint(): array
    {
        return $this->point;
    }
}
