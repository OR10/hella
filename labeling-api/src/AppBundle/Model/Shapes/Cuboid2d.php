<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;
use AppBundle\Model\Shapes;
use AppBundle\Helper\Matrix;

class Cuboid2d extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    /**
     * @var array
     */
    private $frontTopLeft;

    /**
     * @var array
     */
    private $frontTopRight;

    /**
     * @var array
     */
    private $frontBottomRight;

    /**
     * @var array
     */
    private $frontBottomLeft;

    /**
     * @var array
     */
    private $backTopLeft;

    /**
     * @var array
     */
    private $backTopRight;

    /**
     * @var array
     */
    private $backBottomRight;

    /**
     * @var array
     */
    private $backBottomLeft;

    public function __construct(
        $id,
        array $frontTopLeft = null,
        array $frontTopRight = null,
        array $frontBottomRight = null,
        array $frontBottomLeft = null,
        array $backTopLeft = null,
        array $backTopRight = null,
        array $backBottomRight = null,
        array $backBottomLeft = null
    ) {
        $this->id = $id;
        $this->frontTopLeft = $frontTopLeft;
        $this->frontTopRight = $frontTopRight;
        $this->frontBottomRight = $frontBottomRight;
        $this->frontBottomLeft = $frontBottomLeft;
        $this->backTopLeft = $backTopLeft;
        $this->backTopRight = $backTopRight;
        $this->backBottomRight = $backBottomRight;
        $this->backBottomLeft = $backBottomLeft;
    }

    public function getType()
    {
        return 'cuboid2d';
    }

    /**
     * @param array
     *
     * @return Rectangle
     *
     * @throws \RuntimeException
     */
    public static function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['vehicleCoordinates'])
        ) {
            throw new \RuntimeException(
                sprintf('Cuboid2d shape with id "%s" is invalid', isset($shape['id']) ? $shape['id'] : '')
            );
        }

        return new Cuboid2d(
            $shape['id'],
            $shape['vehicleCoordinates'][0],
            $shape['vehicleCoordinates'][1],
            $shape['vehicleCoordinates'][2],
            $shape['vehicleCoordinates'][3],
            $shape['vehicleCoordinates'][4],
            $shape['vehicleCoordinates'][5],
            $shape['vehicleCoordinates'][6],
            $shape['vehicleCoordinates'][7]
        );
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'type' => $this->getType(),
            'vehicleCoordinates' => [
                $this->frontTopLeft,
                $this->frontTopRight,
                $this->frontBottomRight,
                $this->frontBottomLeft,
                $this->backTopLeft,
                $this->backTopRight,
                $this->backBottomRight,
                $this->backBottomLeft
            ]
        ];
    }

    /**
     * @return array
     */
    public function getVertices()
    {
        return [
            new Matrix\Vector3($this->frontTopLeft[0], $this->frontTopLeft[1], 1),
            new Matrix\Vector3($this->frontTopRight[0], $this->frontTopRight[1], 1),
            new Matrix\Vector3($this->frontBottomRight[0], $this->frontBottomRight[1], 1),
            new Matrix\Vector3($this->frontBottomLeft[0], $this->frontBottomLeft[1], 1),
            new Matrix\Vector3($this->backTopLeft[0], $this->backTopLeft[1], 1),
            new Matrix\Vector3($this->backTopRight[0], $this->backTopRight[1], 1),
            new Matrix\Vector3($this->backBottomRight[0], $this->backBottomRight[1], 1),
            new Matrix\Vector3($this->backBottomLeft[0], $this->backBottomLeft[1], 1),
        ];
    }

    /**
     * @return array
     */
    public function getFrontTopLeft()
    {
        return $this->frontTopLeft;
    }

    /**
     * @return array
     */
    public function getFrontTopRight()
    {
        return $this->frontTopRight;
    }

    /**
     * @return array
     */
    public function getFrontBottomRight()
    {
        return $this->frontBottomRight;
    }

    /**
     * @return array
     */
    public function getFrontBottomLeft()
    {
        return $this->frontBottomLeft;
    }

    /**
     * @return array
     */
    public function getBackTopLeft()
    {
        return $this->backTopLeft;
    }

    /**
     * @return array
     */
    public function getBackTopRight()
    {
        return $this->backTopRight;
    }

    /**
     * @return array
     */
    public function getBackBottomRight()
    {
        return $this->backBottomRight;
    }

    /**
     * @return array
     */
    public function getBackBottomLeft()
    {
        return $this->backBottomLeft;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
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
}
