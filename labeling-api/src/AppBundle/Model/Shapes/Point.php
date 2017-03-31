<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Point extends Model\Shape
{
    const TYPE = 'point';
    
    /**
     * @var string
     */
    private $id;

    /**
     * @var array
     */
    private $point = [];

    /**
     * @param array $shape
     *
     * @return Point
     */
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

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return self::TYPE;
    }

    /**
     * @return BoundingBox
     */
    public function getBoundingBox()
    {
        return new BoundingBox($this->point['x'], $this->point['y'], $this->point['x'], $this->point['y']);
    }

    /**
     * @return array
     */
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
