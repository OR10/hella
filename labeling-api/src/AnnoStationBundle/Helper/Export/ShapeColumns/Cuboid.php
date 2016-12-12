<?php

namespace AnnoStationBundle\Helper\Export\ShapeColumns;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;
use AnnoStationBundle\Service;

class Cuboid extends Export\ShapeColumns
{

    /**
     * @var Service\DepthBuffer
     */
    private $depthBuffer;

    /**
     * @param Service\DepthBuffer $depthBuffer
     */
    public function __construct($depthBuffer)
    {
        $this->depthBuffer = $depthBuffer;
    }

    public function create()
    {
        return array(
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 0, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 0, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 1, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 1, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 2, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 2, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 3, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 3, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 4, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 4, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 5, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 5, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 6, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 6, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 7, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 7, Column\Cuboid::AXIS_Y),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 0, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 0, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 0, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 1, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 1, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 1, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 2, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 2, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 2, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 3, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 3, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 3, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 4, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 4, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 4, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 5, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 5, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 5, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 6, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 6, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 6, Column\Cuboid::AXIS_Z),

            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 7, Column\Cuboid::AXIS_X),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 7, Column\Cuboid::AXIS_Y),
            new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 7, Column\Cuboid::AXIS_Z),
        );
    }
}
