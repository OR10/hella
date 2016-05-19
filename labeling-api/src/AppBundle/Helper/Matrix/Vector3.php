<?php
namespace AppBundle\Helper\Matrix;

use AppBundle\Helper;

class Vector3
{
    /**
     * @var
     */
    private $x;

    /**
     * @var
     */
    private $y;

    /**
     * @var
     */
    private $z;

    /**
     * Vector3 constructor.
     * @param $x
     * @param $y
     * @param $z
     */
    public function __construct($x, $y, $z)
    {
        $this->x = $x;
        $this->y = $y;
        $this->z = $z;
    }

    /**
     * @param Matrix4 $matrix4
     * @return $this
     */
    public function applyMatrix4(Helper\Matrix\Matrix4 $matrix4)
    {
        $matrixAsArray = $matrix4->getData();
        $x = $this->x;
        $y = $this->y;
        $z = $this->z;

        $this->x = $matrixAsArray[0] * $x + $matrixAsArray[4] * $y + $matrixAsArray[8] * $z + $matrixAsArray[12];
        $this->y = $matrixAsArray[1] * $x + $matrixAsArray[5] * $y + $matrixAsArray[9] * $z + $matrixAsArray[13];
        $this->z = $matrixAsArray[2] * $x + $matrixAsArray[6] * $y + $matrixAsArray[10] * $z + $matrixAsArray[14];

        return $this;
    }

    /**
     * @return mixed
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     * @return mixed
     */
    public function getY()
    {
        return $this->y;
    }

    /**
     * @return mixed
     */
    public function getZ()
    {
        return $this->z;
    }
}
