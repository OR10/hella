<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Ellipse extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    /**
     * @var float
     */
    private $x;

    /**
     * @var float
     */
    private $y;

    /**
     * @var float
     */
    private $width;

    /**
     * @var float
     */
    private $height;

    /**
     * @param array
     *
     * @return Ellipse
     *
     * @throws \RuntimeException
     */
    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['point']['x'])
            || !isset($shape['point']['y'])
            || !isset($shape['size']['width'])
            || !isset($shape['size']['height'])
        ) {
            throw new \RuntimeException(
                sprintf('Ellipse shape with id "%s" is invalid', isset($shape['id']) ? $shape['id'] : '')
            );
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
        $this->id     = (string) $id;
        $this->x      = (float) $x;
        $this->y      = (float) $y;
        $this->width  = (float) $width;
        $this->height = (float) $height;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return 'ellipse';
    }

    /**
     * @return float
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     * @return float
     */
    public function getY()
    {
        return $this->y;
    }

    /**
     * @return float
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @return float
     */
    public function getHeight()
    {
        return $this->height;
    }

    public function getBoundingBox()
    {
        return new BoundingBox($this->x, $this->y, $this->x + $this->width, $this->y + $this->height);
    }

    public function toArray()
    {
        return [
            'id' => $this->getId(),
            'type' => $this->getType(),
            'point' => [
                'x' => $this->getX(),
                'y' => $this->getY(),
            ],
            'size' => [
                'width'  => $this->getWidth(),
                'height' => $this->getHeight(),
            ],
        ];
    }
}
