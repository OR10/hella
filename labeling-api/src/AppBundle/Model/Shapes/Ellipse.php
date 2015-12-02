<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Ellipse extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    private $point = [];

    private $size = [];

    static public function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['point']['x'])
            || !isset($shape['point']['y'])
            || !isset($shape['size']['width'])
            || !isset($shape['size']['height'])
        ) {
            throw new \RuntimeException('Invalid ellipse shape');
        }

        return new Ellipse(
            $shape['id'],
            $shape['point']['x'],
            $shape['point']['y'],
            $shape['size']['width'],
            $shape['size']['height']
        );
    }

    /**
     * @param string $id
     * @param float  $x
     * @param float  $y
     * @param float  $width
     * @param float  $height
     */
    public function __construct($id, $x, $y, $width, $height)
    {
        $this->id    = (string) $id;
        $this->point = ['x' => (float) $x, 'y' => (float) $y];
        $this->size  = ['width' => (float) $width, 'height' => (float) $height];
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return 'ellipse';
    }

    public function getX()
    {
        return $this->point['x'];
    }

    public function getY()
    {
        return $this->point['y'];
    }

    public function getWidth()
    {
        return $this->size['width'];
    }

    public function getHeight()
    {
        return $this->size['height'];
    }

    public function getBoundingBox()
    {
        return new BoundingBox(
            $this->point['x'],
            $this->point['y'],
            $this->point['x'] + $this->size['width'],
            $this->point['y'] + $this->size['height']
        );
    }

    public function toArray()
    {
        return [
            'id' => (string) $this->id,
            'type' => $this->getType(),
            'point' => [
                'x' => (float) $this->point['x'],
                'y' => (float) $this->point['y'],
            ],
            'size' => [
                'width'  => (float) $this->size['width'],
                'height' => (float) $this->size['height'],
            ],
        ];
    }
}
