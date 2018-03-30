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
     * @var
     */
    private $handleLeft;

    /**
     * @var
     */
    private $handleTop;

    /**
     * @var
     */
    private $handleRight;

    /**
     * @var
     */
    private $handleBottom;

    /*
     * rectangle/trapezoid
     */
    private $trapezoidType;

    /**
     * @param array $shape
     * @return Trapezoid
     */
    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['topLeft']['x'])
            || !isset($shape['topLeft']['y'])
            || !isset($shape['bottomRight']['x'])
            || !isset($shape['bottomRight']['y'])
            || !isset($shape['handleTop']['x'])
            || !isset($shape['handleTop']['y'])
            || !isset($shape['handleBottom']['x'])
            || !isset($shape['handleBottom']['y'])
            || !isset($shape['trapezoidType'])
        ) {
            throw new \RuntimeException(
                sprintf(
                    'Invalid trapezoid shape id:%s topLeft:[x:%s y:%s] bottomRight:[x:%s y:%s]',
                    isset($shape['id']) ? $shape['id'] : '',
                    isset($shape['topLeft']['x']) ? $shape['topLeft']['x'] : '',
                    isset($shape['topLeft']['y']) ? $shape['topLeft']['y'] : '',
                    isset($shape['bottomRight']['x']) ? $shape['bottomRight']['x'] : '',
                    isset($shape['bottomRight']['y']) ? $shape['bottomRight']['y'] : '',
                    isset($shape['handleTop']['x']) ? $shape['handleTop']['x'] : '',
                    isset($shape['handleTop']['y']) ? $shape['handleTop']['y'] : '',
                    isset($shape['handleBottom']['x']) ? $shape['handleBottom']['x'] : '',
                    isset($shape['handleBottom']['y']) ? $shape['handleBottom']['y'] : '',
                    isset($shape['trapezoidType']) ? $shape['trapezoidType'] : ''
                )
            );
        }

        return new Trapezoid(
            $shape['id'],
            $shape['topLeft']['x'],
            $shape['topLeft']['y'],
            $shape['bottomRight']['x'],
            $shape['bottomRight']['y'],
            $shape['trapezoidType'],
            [
                'handleLeft' => $shape['handleTop']['x'],
                'handleTop' => $shape['handleTop']['y'],
                'handleRight' => $shape['handleBottom']['x'],
                'handleBottom' => $shape['handleBottom']['y']
            ]
        );
    }

    /**
     * @param string $id
     * @param float  $left
     * @param float  $top
     * @param float  $right
     * @param float  $bottom
     */
    public function __construct($id, $left, $top, $right, $bottom, $type, array $handle)
    {
        $this->id            = (string) $id;
        $this->left          = (float) $left;
        $this->top           = (float) $top;
        $this->right         = (float) $right;
        $this->bottom        = (float) $bottom;
        $this->trapezoidType = (string) $type;
        $this->handleLeft    = (isset($handle['handleLeft'])) ? (float)$handle['handleLeft'] : '';
        $this->handleTop     = (isset($handle['handleTop'])) ? (float)$handle['handleTop'] : '';
        $this->handleRight   = (isset($handle['handleRight'])) ? (float)$handle['handleRight'] : '';
        $this->handleBottom  = (isset($handle['handleBottom'])) ? (float)$handle['handleBottom'] : '';
    }

    /**
     * @return string
     */
    public function getTrapezoidType()
    {
        return $this->trapezoidType;
    }

    /**
     * @param $type
     */
    public function setTrapezoidType($type)
    {
        $this->trapezoidType = $type;
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
     * @return mixed
     */
    public function getHandleLeft()
    {
        return $this->handleLeft;
    }

    /**
     * @return mixed
     */
    public function getHandleTop()
    {
        return $this->handleTop;
    }

    /**
     * @return mixed
     */
    public function getHandleRight()
    {
        return $this->handleRight;
    }

    /**
     * @return mixed
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
            'trapezoidType' => $this->getTrapezoidType()
        ];
    }
}
