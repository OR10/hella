<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Rectangle extends Model\Shape
{
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
     * @param array
     *
     * @return Rectangle
     *
     * @throws \RuntimeException
     */
    static public function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['topLeft']['x'])
            || !isset($shape['topLeft']['y'])
            || !isset($shape['bottomRight']['x'])
            || !isset($shape['bottomRight']['y'])
        ) {
            throw new \RuntimeException(
                sprintf(
                    'Invalid rectangle shape id:%s topLeft:[x:%s y:%s] bottomRight:[x:%s y:%s]',
                    isset($shape['id']) ? $shape['id'] : '',
                    isset($shape['topLeft']['x']) ? $shape['topLeft']['x'] : '',
                    isset($shape['topLeft']['y']) ? $shape['topLeft']['y'] : '',
                    isset($shape['bottomRight']['x']) ? $shape['bottomRight']['x'] : '',
                    isset($shape['bottomRight']['y']) ? $shape['bottomRight']['y'] : ''
                    )
            );
        }

        return new Rectangle(
            $shape['id'],
            $shape['topLeft']['x'],
            $shape['topLeft']['y'],
            $shape['bottomRight']['x'],
            $shape['bottomRight']['y']
        );
    }

    /**
     * @param string $id
     * @param float  $left
     * @param float  $top
     * @param float  $right
     * @param float  $bottom
     */
    public function __construct($id, $left, $top, $right, $bottom)
    {
        $this->id     = (string) $id;
        $this->left   = (float) $left;
        $this->top    = (float) $top;
        $this->right  = (float) $right;
        $this->bottom = (float) $bottom;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return 'rectangle';
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

    /**
     * @return float
     */
    public function getBottom()
    {
        return $this->bottom;
    }

    public function getBoundingBox()
    {
        return new BoundingBox($this->left, $this->top, $this->right, $this->bottom);
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
        ];
    }
}
