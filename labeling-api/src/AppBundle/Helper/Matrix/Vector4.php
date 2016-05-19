<?php
namespace AppBundle\Helper\Matrix;

use AppBundle\Helper;

class Vector4
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
     * @var
     */
    private $w;

    /**
     * Vector4 constructor.
     * @param $x
     * @param $y
     * @param $z
     * @param $w
     */
    public function __construct($x, $y, $z, $w)
    {
        $this->x = $x;
        $this->y = $y;
        $this->z = $z;
        $this->w = $w;
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
        $w = $this->w;

        $this->x = $matrixAsArray[0] * $x + $matrixAsArray[4] * $y + $matrixAsArray[8] * $z + $matrixAsArray[12] * $w;
        $this->y = $matrixAsArray[1] * $x + $matrixAsArray[5] * $y + $matrixAsArray[9] * $z + $matrixAsArray[13] * $w;
        $this->z = $matrixAsArray[2] * $x + $matrixAsArray[6] * $y + $matrixAsArray[10] * $z + $matrixAsArray[14] * $w;
        $this->w = $matrixAsArray[3] * $x + $matrixAsArray[7] * $y + $matrixAsArray[11] * $z + $matrixAsArray[15] * $w;

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

    /**
     * @return mixed
     */
    public function getW()
    {
        return $this->w;
    }
}
