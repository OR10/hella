<?php

namespace AppBundle\Tests\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AppBundle\Service;
use AppBundle\Tests;
use AppBundle\Helper\Matrix;

class DepthBufferTest extends Tests\KernelTestCase
{
    /**
     * @var Service\DepthBuffer
     */
    private $depthBufferService;

    public function setUpImplementation()
    {
        $this->depthBufferService = $this->getAnnostationService('service.depth_buffer');
    }

    public function dataProvider()
    {
        return array(
            array(
                new Shapes\Cuboid3d(
                    '1',
                    [16, 6.5, 1.7],
                    [16, 4.8, 1.7],
                    [16, 4.8, 0],
                    [16, 6.5, 0],
                    [20, 6.5, 1.7],
                    [20, 4.8, 1.7],
                    [20, 4.8, 0],
                    [20, 6.5, 0]
                ),
                array(
                    array(112.80616622260311, 285.93087148874531),
                    array(227.09711066435307, 285.68203382846434),
                    array(227.49100381923915, 405.21592278691639),
                    array(113.31951292964175, 404.05956991837525),
                    array(194.21885932544245, 289.73635785405827),
                    array(288.73125614555596, 289.60064757348266),
                    array(288.94462245218045, 386.98262275740518),
                    array(194.50123752813494, 386.35101750958017),
                ),
                array(true, true, true, true, false, true, true, false),
            ),
        );
    }

    /**
     * @dataProvider dataProvider
     *
     * @param Shapes\Cuboid3d $cuboid3d
     * @param array           $expectedVertices
     * @param array           $expectedVertexVisibility
     */
    public function testDepthBuffer(Shapes\Cuboid3d $cuboid3d, array $expectedVertices, array $expectedVertexVisibility)
    {
        $calibrationData = [
            'cameraMatrix'           => [
                1220.70739746,
                0,
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
                1,
            ],
            'rotationMatrix'         => [
                0,
                -1,
                0,
                0,
                0,
                0,
                -1,
                0,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
            ],
            'translation'            => [
                -1.09999997616,
                0.0799999982119,
                1.39999997616,
            ],
            'distortionCoefficients' => [
                -0.192208706592,
                0.0590421349576,
                0,
                0,
                0,
            ],
        ];

        $vertices = $this->depthBufferService->getVertices($cuboid3d, $calibrationData);

        $this->assertEquals($expectedVertices, $vertices[0]);
        $this->assertEquals($expectedVertexVisibility, $vertices[1]);
    }
}
