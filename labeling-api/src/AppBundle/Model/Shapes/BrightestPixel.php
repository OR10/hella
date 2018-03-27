<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;
use AppBundle\Model\Shapes;

class BrightestPixel extends Model\Shape
{
    const TYPE = 'brightestPixel';

    /**
     * @var string
     */
    private $id;

    /**
     * @var float
     */
    private $left;

    /**
     * @var float
     */
    private $top;

    /**
     * @var float
     */
    private $right;

    /**
     * @var float
     */
    private $bottom;

    /**
     * @var array
     */
    private $pixel = [];

    /**
     * @param string $id
     * @param float  $left
     * @param float  $top
     * @param float  $right
     * @param float  $bottom
     * @param array $pixel
     */
    public function __construct($id, $left, $top, $right, $bottom, array $pixel)
    {
        $this->id     = (string) $id;
        $this->left   = (float) $left;
        $this->top    = (float) $top;
        $this->right  = (float) $right;
        $this->bottom = (float) $bottom;
        $this->pixel = [
            'x' => $pixel['x'],
            'y' => $pixel['y'],
        ];
    }

    public function getId()
    {
        return $this->id;
    }

    /**
     * @return float
     */
    public function getLeft()
    {
        return $this->left;
    }

    /**
     * @return float
     */
    public function getTop()
    {
        return $this->top;
    }

    /**
     * @return float
     */
    public function getRight()
    {
        return $this->right;
    }

    /**
     * @return mixed
     */
    public function getBottom()
    {
        return $this->bottom;
    }

    /**
     * @return float
     */
    public function getWidth()
    {
        return $this->right - $this->left;
    }

    /**
     * @return float
     */
    public function getHeight()
    {
        return $this->bottom - $this->top;
    }

    public function getType()
    {
        return self::TYPE;
    }

    /**
     * Get the bounding box for this shape.
     *
     * @return Shapes\BoundingBox
     */
    public function getBoundingBox()
    {
        // TODO: Implement getBoundingBox() method.
    }

    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['topLeft']['x'])
            || !isset($shape['topLeft']['y'])
            || !isset($shape['bottomRight']['x'])
            || !isset($shape['bottomRight']['y'])
            || !isset($shape['pixel'])
        ) {
            throw new \RuntimeException(
                sprintf('BrightestPixel shape with id "%s" is invalid', isset($shape['id']) ? $shape['id'] : '')
            );
        }

        return new BrightestPixel(
            $shape['id'],
            $shape['topLeft']['x'],
            $shape['topLeft']['y'],
            $shape['bottomRight']['x'],
            $shape['bottomRight']['y'],
            $shape['pixel']
        );
    }

    public function toArray()
    {
        return [
            'id' => $this->getId(),
            'type' => $this->getType(),
            'topLeft' => [
                'x' => $this->getLeft(),
                'y' => $this->getTop(),
            ],
            'bottomRight' => [
                'x' => $this->getRight(),
                'y' => $this->getBottom(),
            ],
            'pixel' => $this->pixel,
        ];
    }

    /**
     * @return array
     */
    public function getPoint(): array
    {
        return $this->pixel;
    }

}