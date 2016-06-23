<?php

namespace AppBundle\Tests\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Tests;
use AppBundle\Worker\JobInstruction;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool;

class CalibrationFileConverterTest extends Tests\KernelTestCase
{
    /**
     * @var Service\CalibrationFileConverter
     */
    private $calibrationFileConverterService;

    public function setUpImplementation()
    {
        $this->calibrationFileConverterService = $this->getAnnostationService(
            'service.calibration_file_converter'
        );
    }

    public function calibrationProvider()
    {
        return array(
            array(
                __DIR__ . '/CalibrationFileConverter/SMPC16C00103_SE-OOX687_20150616_145418_rgb_c.csv',
                array(
                    "rawCalibrationData" => array(
                        "camera" => "SMPC16_C0_0103",
                        "intern_px" => "1104",
                        "intern_py" => "620",
                        "intern_half" => " true",
                        "intern_2_fx" => "1220.70739746",
                        "intern_2_fy" => "1221.07788086",
                        "intern_2_ga" => "0.0",
                        "intern_2_xc" => "559.203125",
                        "intern_2_yc" => "306.796875",
                        "intern_2_kappa" => "[-0.192208706592, 0.0590421349576]",
                        "extern_h" => "0.0",
                        "extern_2_X" => "-1.09999997616",
                        "extern_2_Y" => "0.0799999982119",
                        "extern_2_Z" => "1.39999997616",
                        "extern_2_ea" => "[\"Z90X90Z\", 0.013573, 0.003194, 0.010063]"
                    ),
                    "cameraMatrix" => array(
                        1220.70739746,
                        0.0,
                        559.203125,
                        0,
                        0,
                        1221.07788086,
                        306.796875,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        1
                    ),
                    "rotationMatrix" => array(
                        0.013604451039289,
                        -0.99985682510335,
                        -0.010062948670512,
                        0,
                        0.0030569589937716,
                        0.010105423046469,
                        -0.99994426788736,
                        0,
                        0.99990278790581,
                        0.013572930766656,
                        0.003194,
                        0,
                        0,
                        0,
                        0,
                        1
                    ),
                    "translation" => array(
                        -1.09999997616,
                        0.0799999982119,
                        1.39999997616
                    ),
                    "distortionCoefficients" => array(
                        -0.192208706592,
                        0.0590421349576,
                        0,
                        0,
                        0
                    )
                )
            )
        );
    }

    /**
     * @dataProvider calibrationProvider
     *
     * @param $filePath
     * @param $expectedData
     */
    public function testRawData($filePath, $expectedData)
    {
        $this->calibrationFileConverterService->setCalibrationData($filePath);
        $this->assertEquals(
            $expectedData['rawCalibrationData'],
            $this->calibrationFileConverterService->getRawData()
        );
    }

    /**
     * @dataProvider calibrationProvider
     *
     * @param $filePath
     * @param $expectedData
     */
    public function testCameraMatrix($filePath, $expectedData)
    {
        $this->calibrationFileConverterService->setCalibrationData($filePath);
        $this->assertEquals(
            $expectedData['cameraMatrix'],
            $this->calibrationFileConverterService->getCameraMatrix()
        );
    }

    /**
     * @dataProvider calibrationProvider
     *
     * @param $filePath
     * @param $expectedData
     */
    public function testRotationMatrix($filePath, $expectedData)
    {
        $this->calibrationFileConverterService->setCalibrationData($filePath);
        $this->assertEquals(
            $expectedData['rotationMatrix'],
            $this->calibrationFileConverterService->getRotationMatrix()
        );
    }

    /**
     * @dataProvider calibrationProvider
     *
     * @param $filePath
     * @param $expectedData
     */
    public function testTranslation($filePath, $expectedData)
    {
        $this->calibrationFileConverterService->setCalibrationData($filePath);
        $this->assertEquals(
            $expectedData['translation'],
            $this->calibrationFileConverterService->getTranslation()
        );
    }

    /**
     * @dataProvider calibrationProvider
     *
     * @param $filePath
     * @param $expectedData
     */
    public function testDistortionCoefficients($filePath, $expectedData)
    {
        $this->calibrationFileConverterService->setCalibrationData($filePath);
        $this->assertEquals(
            $expectedData['distortionCoefficients'],
            $this->calibrationFileConverterService->getDistortionCoefficients()
        );
    }
}