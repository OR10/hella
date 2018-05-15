<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Trapezoid extends Model\Shape
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
     * @var float|null
     */
    private $handleLeft;

    /**
     * @var float|null
     */
    private $handleTop;

    /**
     * @var float|null
     */
    private $handleRight;

    /**
     * @var float|null
     */
    private $handleBottom;

    /**
     * @param array|mixed[] $shape
     * @return Trapezoid
     */
    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['topLeft']['x'])
            || !isset($shape['topLeft']['y'])
            || !isset($shape['bottomRight']['x'])
            || !isset($shape['bottomRight']['y'])
        ) {
            $format = 'Invalid trapezoid shape id:%s topLeft:[x:%s y:%s] bottomRight:[x:%s y:%s]';
            $format .= ' handleTop:[x:%s y:%s] handleBottom:[x:%s y:%s].';

            throw new \RuntimeException(
                sprintf(
                    $format,
                    isset($shape['id']) ? $shape['id'] : '',
                    isset($shape['topLeft']['x']) ? $shape['topLeft']['x'] : '',
                    isset($shape['topLeft']['y']) ? $shape['topLeft']['y'] : '',
                    isset($shape['bottomRight']['x']) ? $shape['bottomRight']['x'] : '',
                    isset($shape['bottomRight']['y']) ? $shape['bottomRight']['y'] : '',
                    //not required fields:
                    isset($shape['handleTop']['x']) ? $shape['handleTop']['x'] : '',
                    isset($shape['handleTop']['y']) ? $shape['handleTop']['y'] : '',
                    isset($shape['handleBottom']['x']) ? $shape['handleBottom']['x'] : '',
                    isset($shape['handleBottom']['y']) ? $shape['handleBottom']['y'] : ''
                )
            );
        }

        return new self(
            $shape['id'],
            $shape['topLeft']['x'],
            $shape['topLeft']['y'],
            $shape['bottomRight']['x'],
            $shape['bottomRight']['y'],
            [
                'handleLeft' => $shape['handleTop']['x'],
                'handleTop' => $shape['handleTop']['y'],
                'handleRight' => $shape['handleBottom']['x'],
                'handleBottom' => $shape['handleBottom']['y']
            ]
        );
    }

    /**
     * true - Full feature trapezoid
     * false - Trapezoid with the appearance like a rectangle
     *
     * @return bool
     */
    public function isTrapezoid()
    {
        $isTrapezoid = true;
        if (is_null($this->handleBottom) || is_null($this->handleTop)
            || is_null($this->handleLeft) || is_null($this->handleRight)) {
            $isTrapezoid = false;
        }

        return $isTrapezoid;
    }

    /**
     * @param string $id
     * @param float  $left
     * @param float  $top
     * @param float  $right
     * @param float  $bottom
     * @param array[array] $handle
     */
    public function __construct($id, $left, $top, $right, $bottom, array $handle)
    {
        $this->id            = (string) $id;
        $this->left          = (float) $left;
        $this->top           = (float) $top;
        $this->right         = (float) $right;
        $this->bottom        = (float) $bottom;
        $this->handleLeft    = (isset($handle['handleLeft'])) ? (float)$handle['handleLeft'] : null;
        $this->handleTop     = (isset($handle['handleTop'])) ? (float)$handle['handleTop'] : null;
        $this->handleRight   = (isset($handle['handleRight'])) ? (float)$handle['handleRight'] : null;
        $this->handleBottom  = (isset($handle['handleBottom'])) ? (float)$handle['handleBottom'] : null;
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
        return 'trapezoid';
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

    /**
     * @return float|null
     */
    public function getHandleLeft()
    {
        return $this->handleLeft;
    }

    /**
     * @return float|null
     */
    public function getHandleTop()
    {
        return $this->handleTop;
    }

    /**
     * @return float|null
     */
    public function getHandleRight()
    {
        return $this->handleRight;
    }

    /**
     * @return float|null
     */
    public function getHandleBottom()
    {
        return $this->handleBottom;
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
            //need modify in future
            'handleTop'    => [
                'x' => $this->getHandleLeft(),
                'y' => $this->getHandleTop(),
            ],
            'handleBottom' => [
                'x' => $this->getHandleRight(),
                'y' => $this->getHandleBottom(),
            ],
        ];
    }
}
