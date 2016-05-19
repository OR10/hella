<?php
namespace AppBundle\Helper\Matrix;

use AppBundle\Helper;

class Matrix4
{
    /**
     * @var array
     */
    private $data = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    /**
     * Matrix4 constructor.
     * @param array|null $data
     */
    public function __construct(array $data = null)
    {
        if ($data !== null) {
            $this->data = $data;
        }
    }

    /**
     * @param Matrix4 $matrix4
     * @return $this
     */
    public function multiply(Helper\Matrix\Matrix4 $matrix4)
    {
        $matrix4Data = $matrix4->getData();

        $a11 = $this->data[0];
        $a12 = $this->data[4];
        $a13 = $this->data[8];
        $a14 = $this->data[12];

        $a21 = $this->data[1];
        $a22 = $this->data[5];
        $a23 = $this->data[9];
        $a24 = $this->data[13];

        $a31 = $this->data[2];
        $a32 = $this->data[6];
        $a33 = $this->data[10];
        $a34 = $this->data[14];

        $a41 = $this->data[3];
        $a42 = $this->data[7];
        $a43 = $this->data[11];
        $a44 = $this->data[15];

        $b11 = $matrix4Data[0];
        $b12 = $matrix4Data[4];
        $b13 = $matrix4Data[8];
        $b14 = $matrix4Data[12];

        $b21 = $matrix4Data[1];
        $b22 = $matrix4Data[5];
        $b23 = $matrix4Data[9];
        $b24 = $matrix4Data[13];

        $b31 = $matrix4Data[2];
        $b32 = $matrix4Data[6];
        $b33 = $matrix4Data[10];
        $b34 = $matrix4Data[14];

        $b41 = $matrix4Data[3];
        $b42 = $matrix4Data[7];
        $b43 = $matrix4Data[11];
        $b44 = $matrix4Data[15];

        $this->data[0] = $a11 * $b11 + $a12 * $b21 + $a13 * $b31 + $a14 * $b41;
        $this->data[4] = $a11 * $b12 + $a12 * $b22 + $a13 * $b32 + $a14 * $b42;
        $this->data[8] = $a11 * $b13 + $a12 * $b23 + $a13 * $b33 + $a14 * $b43;
        $this->data[12] = $a11 * $b14 + $a12 * $b24 + $a13 * $b34 + $a14 * $b44;

        $this->data[1] = $a21 * $b11 + $a22 * $b21 + $a23 * $b31 + $a24 * $b41;
        $this->data[5] = $a21 * $b12 + $a22 * $b22 + $a23 * $b32 + $a24 * $b42;
        $this->data[9] = $a21 * $b13 + $a22 * $b23 + $a23 * $b33 + $a24 * $b43;
        $this->data[13] = $a21 * $b14 + $a22 * $b24 + $a23 * $b34 + $a24 * $b44;

        $this->data[2] = $a31 * $b11 + $a32 * $b21 + $a33 * $b31 + $a34 * $b41;
        $this->data[6] = $a31 * $b12 + $a32 * $b22 + $a33 * $b32 + $a34 * $b42;
        $this->data[10] = $a31 * $b13 + $a32 * $b23 + $a33 * $b33 + $a34 * $b43;
        $this->data[14] = $a31 * $b14 + $a32 * $b24 + $a33 * $b34 + $a34 * $b44;

        $this->data[3] = $a41 * $b11 + $a42 * $b21 + $a43 * $b31 + $a44 * $b41;
        $this->data[7] = $a41 * $b12 + $a42 * $b22 + $a43 * $b32 + $a44 * $b42;
        $this->data[11] = $a41 * $b13 + $a42 * $b23 + $a43 * $b33 + $a44 * $b43;
        $this->data[15] = $a41 * $b14 + $a42 * $b24 + $a43 * $b34 + $a44 * $b44;

        return $this;
    }

    /**
     * @param $x
     * @param $y
     * @param $z
     * @return $this
     */
    public function makeTranslation($x, $y, $z)
    {
        return $this->set([
            1, 0, 0, $x,
            0, 1, 0, $y,
            0, 0, 1, $z,
            0, 0, 0, 1
        ]);
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @param array $data
     * @return $this
     */
    public function set($data)
    {
        $this->data = [
            $data[0], $data[4], $data[8], $data[12],
            $data[1], $data[5], $data[9], $data[13],
            $data[2], $data[6], $data[10], $data[14],
            $data[3], $data[7], $data[11], $data[15],
        ];

        return $this;
    }
}
