<?php

namespace AppBundle\Tests\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Tests;
use AppBundle\Helper\Matrix;

class MatrixProjectionTest extends Tests\KernelTestCase
{
    /**
     * @var Service\MatrixProjection
     */
    private $matrixProjectionService;

    public function setUpImplementation()
    {
        $this->matrixProjectionService = $this->getAnnostationService('service.matrix_projection');
    }

    public function vectorProvider()
    {
        return array(
            array(
                new Matrix\Vector4(10, 0, 0, 1),
                new Matrix\Vector3(513.38264574242555, 451.52191267597999, 1),
            ),
            array(
                new Matrix\Vector4(10, -3, 0, 1),
                new Matrix\Vector3(837.01389489958046, 446.51296059359379, 1),
            ),
            array(
                new Matrix\Vector4(10, 3, 0, 1),
                new Matrix\Vector3(191.3082775041201, 452.27059987790159, 1),
            ),
            array(
                new Matrix\Vector4(10, 0, 2, 1),
                new Matrix\Vector3(511.1937227726749, 232.04437984222375, 1),
            ),
            array(
                new Matrix\Vector4(55.099998, 5.2, 0.8, 1),
                new Matrix\Vector3(406.90605769293109, 324.24409057197249, 1),
            ),
        );
    }

    /**
     * @dataProvider vectorProvider
     *
     * @param $vectorIn
     * @param $expectedVector
     */
    public function test3dto2dProjection($vectorIn, $expectedVector)
    {
        $fx = 1215.718750;
        $fy = 1220.562500;

        $ga = 0.0;

        $xc = 504.218750;
        $yc = 309.375000;

        $k0 = -0.207642;
        $k1 = 0.039917;

        $yaw   = 0.013573;
        $pitch = 0.003194;
        $roll  = 0.010063;

        $camX = -1.099854;
        $camY = -0.079834;
        $camZ = 1.261230;

        // Pre calculation for rotation matrix
        $cosr = cos($roll);
        $cosp = cos($pitch);
        $cosy = cos($yaw);

        $calibrationData = [
            'cameraMatrix'           => [
                $fx,
                $ga,
                $xc,
                0,
                0,
                $fy,
                $yc,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
            ],
            'rotationMatrix'         => [
                $cosr * $yaw + $cosy * $roll * $pitch,
                $yaw * $roll * $pitch - $cosr * $cosy,
                -$roll * $cosp,
                0,
                $cosy * $cosr * $pitch - $roll * $yaw,
                $cosy * $roll + $cosr * $pitch * $yaw,
                -$cosr * $cosp,
                0,
                $cosp * $cosy,
                $cosp * $yaw,
                $pitch,
                0,
                0,
                0,
                0,
                1,
            ],
            'translation'            => [
                $camX,
                $camY,
                $camZ,
            ],
            'distortionCoefficients' => [
                $k0,
                $k1,
                0,
                0,
                0,
            ],
        ];

        $vectorOut = $this->matrixProjectionService->project3dTo2d($vectorIn, $calibrationData);

        $this->assertEquals($vectorOut, $expectedVector);
    }
}
