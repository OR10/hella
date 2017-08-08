<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;
use AppBundle\Model\Shapes;

class Pedestrian extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    /**
     * @var
     */
    private $topCenterX;

    /**
     * @var
     */
    private $topCenterY;

    /**
     * @var
     */
    private $bottomCenterX;

    /**
     * @var
     */
    private $bottomCenterY;

    public function __construct($id, $topCenterX, $topCenterY, $bottomCenterX, $bottomCenterY)
    {
        $this->id = $id;
        $this->topCenterX = $topCenterX;
        $this->topCenterY = $topCenterY;
        $this->bottomCenterX = $bottomCenterX;
        $this->bottomCenterY = $bottomCenterY;
    }

    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['topCenter']['x'])
            || !isset($shape['topCenter']['y'])
            || !isset($shape['bottomCenter']['x'])
            || !isset($shape['bottomCenter']['y'])
        ) {
            throw new \RuntimeException(
                sprintf('Pedestrian shape with id "%s" is invalid', isset($shape['id']) ? $shape['id'] : '')
            );
        }

        return new Pedestrian(
            $shape['id'],
            $shape['topCenter']['x'],
            $shape['topCenter']['y'],
            $shape['bottomCenter']['x'],
            $shape['bottomCenter']['y']
        );
    }

    /**
     * Get the id of this shape.
     *
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get the type of the shape.
     *
     * @return string
     */
    public function getType()
    {
        return 'pedestrian';
    }

    /**
     * Get the bounding box for this shape.
     *
     * @return Shapes\BoundingBox
     */
    public function getBoundingBox()
    {
        return new BoundingBox(
            $this->getTopCenterX(),
            $this->getTopCenterY(),
            $this->getBottomCenterX(),
            $this->getBottomCenterY()
        );
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'id' => $this->getId(),
            'type' => $this->getType(),
            'topCenter' => [
                'x' => $this->getTopCenterX(),
                'y' => $this->getTopCenterY(),
            ],
            'bottomCenter' => [
                'x' => $this->getBottomCenterX(),
                'y' => $this->getBottomCenterY(),
            ],
        ];
    }

    /**
     * @return mixed
     */
    public function getTopCenterX()
    {
        return $this->topCenterX;
    }

    /**
     * @return mixed
     */
    public function getTopCenterY()
    {
        return $this->topCenterY;
    }

    /**
     * @return mixed
     */
    public function getBottomCenterX()
    {
        return $this->bottomCenterX;
    }

    /**
     * @return mixed
     */
    public function getBottomCenterY()
    {
        return $this->bottomCenterY;
    }
}
