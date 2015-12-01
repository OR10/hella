<?php

namespace AppBundle\Model\Shapes;

class BoundingBox
{
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
     * @param float $left
     * @param float $top
     * @param float $right
     * @param float $bottom
     */
    public function __construct($left, $top, $right, $bottom)
    {
        $this->left   = (float) $left;
        $this->top    = (float) $top;
        $this->right  = (float) $right;
        $this->bottom = (float) $bottom;
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
    public function getBottom()
    {
        return $this->bottom;
    }

    /**
     * @param BoundingBox $other
     *
     * @return BoundingBox
     */
    public function merge(BoundingBox $other)
    {
        return new BoundingBox(
            min($this->getLeft(), $other->getLeft()),
            min($this->getTop(), $other->getTop()),
            max($this->getRight(), $other->getRight()),
            max($this->getBottom(), $other->getBottom())
        );
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'left'   => $this->left,
            'top'    => $this->top,
            'right'  => $this->right,
            'bottom' => $this->bottom,
        ];
    }
}
