<?php

namespace AnnoStationBundle\Tests\Service\Interpolation\Algorithm;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AnnoStationBundle\Service;
use AppBundle\Tests;

class LinearTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Service\Interpolation\Algorithm\Linear
     */
    private $algorithm;

    /**
     * @var Service\CalibrationFileConverter
     */
    private $calibrationFileConverter;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->algorithm                 = $this->getAnnostationService('service.interpolation.algorithm.linear');
        $this->calibrationFileConverter  = $this->getAnnostationService('service.calibration_file_converter');
        $this->calibrationDataFacade     = $this->getAnnostationService('database.facade.calibration_data');
        $this->organisationFacade        = $this->getAnnostationService('database.facade.organisation');
    }

    /**
     * @expectedException AnnoStationBundle\Service\Interpolation\Exception
     */
    public function testInterpolationWithoutAnyLabeledThingInFrameThrowsException()
    {
        $thing = $this->createLabeledThing();

        $this->algorithm->interpolate(
            $thing,
            $thing->getFrameRange(),
            function () {
            }
        );
    }

    public function testInterpolationWithASingleLabeledThingInFrameEmitsThisLabeledThingInFrame()
    {
        $thing        = $this->createLabeledThing();
        $thingInFrame = $this->createLabeledThingInFrame(
            $thing,
            1,
            [
                new Shapes\Rectangle('test', 5, 5, 10, 10),
            ]
        );

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 1),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $this->assertLabeledThingsInFrameAreEqual([$thingInFrame], $emitted);
    }

    public function testInterpolationWithTwoLabeledThingsInFrameEmitsBothLabeledThingsInFrame()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                1,
                [
                    new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                2,
                [
                    new Shapes\Rectangle('test-2', 5, 5, 10, 10),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 2),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $this->assertLabeledThingsInFrameAreEqual($thingsInFrame, $emitted);
    }

    public function testInterpolationClonesFirstFoundLabeledThingInFrameWhenStartFrameIsLowerThanFoundFrameIndex()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Rectangle('test-3', 5, 5, 10, 10),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 3),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function ($frameIndex) use ($thingsInFrame) {
                return $thingsInFrame[0]->copy($frameIndex);
            },
            range(1, 3)
        );

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationClonesLastFoundLabeledThingInFrameWhenEndFrameIsGreaterThanFoundFrameIndex()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Rectangle('test-3', 5, 5, 10, 10),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(3, 10),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function ($frameIndex) use ($thingsInFrame) {
                return $thingsInFrame[0]->copy($frameIndex);
            },
            range(3, 10)
        );

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationBetweenTwoLabeledThingsInFrameWithSameShapes()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Rectangle('test', 5, 5, 10, 10),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                7,
                [
                    new Shapes\Rectangle('test', 5, 5, 10, 10),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(3, 7),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function ($frameIndex) use ($thingsInFrame) {
                return $thingsInFrame[0]->copy($frameIndex);
            },
            range(4, 6)
        );
        array_unshift($expected, $thingsInFrame[0]);
        $expected[] = $thingsInFrame[1];

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationBetweenTwoLabeledThingsInFrameWithMovedAndResizedShapes()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                    new Shapes\Rectangle('test-2', 100, 100, 200, 200),
                    new Shapes\Ellipse('test-3', 100, 100, 200, 200),
                    new Shapes\Polygon('test-4', [['x' => 100, 'y' => 75], ['x' => 120, 'y' => 160]]),
                    new Shapes\Polyline('test-5', [['x' => 150, 'y' => 175], ['x' => 170, 'y' => 120]]),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                7,
                [
                    new Shapes\Rectangle('test-1', 8, 8, 20, 20),
                    new Shapes\Rectangle('test-2', 200, 200, 100, 100),
                    new Shapes\Ellipse('test-3', 200, 200, 100, 100),
                    new Shapes\Polygon('test-4', [['x' => 170, 'y' => 200], ['x' => 320, 'y' => 380]]),
                    new Shapes\Polyline('test-5', [['x' => 10, 'y' => 20], ['x' => 120, 'y' => 280]]),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(3, 7),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing,
                3,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                        new Shapes\Rectangle('test-2', 100, 100, 200, 200),
                        new Shapes\Ellipse('test-3', 100, 100, 200, 200),
                        new Shapes\Polygon('test-4', [['x' => 100, 'y' => 75], ['x' => 120, 'y' => 160]]),
                        new Shapes\Polyline('test-5', [['x' => 150, 'y' => 175], ['x' => 170, 'y' => 120]]),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                4,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 5.75, 5.75, 12.5, 12.5),
                        new Shapes\Rectangle('test-2', 125, 125, 175, 175),
                        new Shapes\Ellipse('test-3', 125, 125, 175, 175),
                        new Shapes\Polygon('test-4', [['x' => 117.5, 'y' => 106.25], ['x' => 170, 'y' => 215]]),
                        new Shapes\Polyline('test-5', [['x' => 115, 'y' => 136.25], ['x' => 157.5, 'y' => 160]]),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                5,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 6.5, 6.5, 15, 15),
                        new Shapes\Rectangle('test-2', 150, 150, 150, 150),
                        new Shapes\Ellipse('test-3', 150, 150, 150, 150),
                        new Shapes\Polygon('test-4', [['x' => 135, 'y' => 137.5], ['x' => 220, 'y' => 270]]),
                        new Shapes\Polyline('test-5', [['x' => 80, 'y' => 97.5], ['x' => 145.0, 'y' => 200]]),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                6,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 7.25, 7.25, 17.5, 17.5),
                        new Shapes\Rectangle('test-2', 175, 175, 125, 125),
                        new Shapes\Ellipse('test-3', 175, 175, 125, 125),
                        new Shapes\Polygon('test-4', [['x' => 152.5, 'y' => 168.75], ['x' => 270, 'y' => 325]]),
                        new Shapes\Polyline('test-5', [['x' => 45, 'y' => 58.75], ['x' => 132.5, 'y' => 240]]),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                7,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 8, 8, 20, 20),
                        new Shapes\Rectangle('test-2', 200, 200, 100, 100),
                        new Shapes\Ellipse('test-3', 200, 200, 100, 100),
                        new Shapes\Polygon('test-4', [['x' => 170, 'y' => 200], ['x' => 320, 'y' => 380]]),
                        new Shapes\Polyline('test-5', [['x' => 10, 'y' => 20], ['x' => 120, 'y' => 280]]),
                    ]
                )
            ),
        ];

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationWithWithMultipleExistingLabeledThingsInFrame()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                0,
                [
                    new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                4,
                [
                    new Shapes\Rectangle('test-1', 10, 10, 20, 20),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                9,
                [
                    new Shapes\Rectangle('test-1', 5, 5, 30, 30),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(0, 9),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing,
                0,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                1,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 6.25, 6.25, 12.5, 12.5),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                2,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 7.5, 7.5, 15, 15),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                3,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 8.75, 8.75, 17.5, 17.5),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                4,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 10, 10, 20, 20),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                5,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 9, 9, 22, 22),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                6,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 8, 8, 24, 24),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                7,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 7, 7, 26, 26),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                8,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 6, 6, 28, 28),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                9,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Rectangle('test-1', 5, 5, 30, 30),
                    ]
                )
            ),
        ];

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testCuboid3dInterpolation()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                1,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [16, 6.5, 1.7],
                        [16, 4.8, 1.7],
                        [16, 4.8, 0],
                        [16, 6.5, 0],
                        [20, 6.5, 1.7],
                        [20, 4.8, 1.7],
                        [20, 4.8, 0],
                        [20, 6.5, 0]
                    ),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [17, 6.5, 1.7],
                        [17, 4.8, 1.7],
                        [17, 4.8, 0],
                        [17, 6.5, 0],
                        [20, 6.5, 1.7],
                        [20, 4.8, 1.7],
                        [20, 4.8, 2],
                        [20, 7.5, 2]
                    ),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 3),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing,
                1,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [16, 6.5, 1.7],
                            [16, 4.8, 1.7],
                            [16, 4.8, 0],
                            [16, 6.5, 0],
                            [20, 6.5, 1.7],
                            [20, 4.8, 1.7],
                            [20, 4.8, 0],
                            [20, 6.5, 0]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                2,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [16.5, 6.5, 1.7],
                            [16.5, 4.8, 1.7],
                            [16.5, 4.8, 0],
                            [16.5, 6.5, 0],
                            [20, 6.5, 1.7],
                            [20, 4.8, 1.7],
                            [20, 4.8, 1],
                            [20, 7, 1]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                3,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [17, 6.5, 1.7],
                            [17, 4.8, 1.7],
                            [17, 4.8, 0],
                            [17, 6.5, 0],
                            [20, 6.5, 1.7],
                            [20, 4.8, 1.7],
                            [20, 4.8, 2],
                            [20, 7.5, 2]
                        ),
                    ]
                )
            ),
        ];
        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testCuboid2dto2dInterpolation()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                1,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [5, 5, 5],
                        [10, 20, 30],
                        [1, 20, 20],
                        [30, 30, 30],
                        null,
                        null,
                        null,
                        null
                    ),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [50, 50, 50],
                        [100, 100, 100],
                        [200, 200, 200],
                        [300, 300, 300],
                        null,
                        null,
                        null,
                        null
                    ),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 3),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing,
                1,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [5, 5, 5],
                            [10, 20, 30],
                            [1, 20, 20],
                            [30, 30, 30],
                            null,
                            null,
                            null,
                            null
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                2,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [27.5, 27.5, 27.5],
                            [55, 60, 65],
                            [100.5, 110, 110],
                            [165, 165, 165],
                            null,
                            null,
                            null,
                            null
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                3,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [50, 50, 50],
                            [100, 100, 100],
                            [200, 200, 200],
                            [300, 300, 300],
                            null,
                            null,
                            null,
                            null
                        ),
                    ]
                )
            ),
        ];
        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testCuboid3dInterpolationWith2d()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                1,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [20, 1, 1],
                        [20, -1, 1],
                        [20, -1, 0],
                        [20, 1, 0],
                        [24, 1, 1],
                        [24, -1, 1],
                        [24, -1, 0],
                        [24, 1, 0]
                    ),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                4,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [36, 1, 1],
                        [36, -1, 1],
                        [36, -1, 0],
                        [36, 1, 0],
                        [24, 1, 1],
                        [24, -1, 1],
                        [24, -1, 0],
                        [24, 1, 0]
                    ),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 4),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing,
                1,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [20, 1, 1],
                            [20, -1, 1],
                            [20, -1, 0],
                            [20, 1, 0],
                            [24, 1, 1],
                            [24, -1, 1],
                            [24, -1, 0],
                            [24, 1, 0]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                2,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            null,
                            null,
                            null,
                            null,
                            [24, 1, 1],
                            [24, -1, 1],
                            [24, -1, 0],
                            [24, 1, 0]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                3,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [30.666666666667, 1, 1],
                            [30.666666666667, -1, 1],
                            [30.666666666667, -1, 0],
                            [30.666666666667, 1, 0],
                            [24, 1, 1],
                            [24, -1, 1],
                            [24, -1, 0],
                            [24, 1, 0]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                4,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [36, 1, 1],
                            [36, -1, 1],
                            [36, -1, 0],
                            [36, 1, 0],
                            [24, 1, 1],
                            [24, -1, 1],
                            [24, -1, 0],
                            [24, 1, 0]
                        ),
                    ]
                )
            ),
        ];
        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testCuboid3dInterpolationWith2dStarting()
    {
        $thing         = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame(
                $thing,
                1,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        null,
                        null,
                        null,
                        null,
                        [20, 6.5, 1.7],
                        [20, 4.8, 1.7],
                        [20, 4.8, 0],
                        [20, 6.5, 0]
                    ),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                3,
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [12, 8.5, 3.7],
                        [12, 6.8, 3.7],
                        [12, 6.8, 2],
                        [12, 7.5, 2],
                        [20, 7.5, 3.7],
                        [20, 6.8, 3.7],
                        [20, 6.8, 2],
                        [20, 8.5, 2]
                    ),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 3),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing,
                1,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            null,
                            null,
                            null,
                            null,
                            [20, 6.5, 1.7],
                            [20, 4.8, 1.7],
                            [20, 4.8, 0],
                            [20, 6.5, 0]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                2,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [11.968871125850725, 7.5, 2.7000000000000002],
                            [11.968871125850725, 5.7999999999999998, 2.7000000000000002],
                            [11.968871125850725, 5.7999999999999998, 1],
                            [11.968871125850725, 7, 1],
                            [20, 7, 2.7000000000000002],
                            [20, 5.7999999999999998, 2.7000000000000002],
                            [20, 5.7999999999999998, 1],
                            [20, 7.5, 1]
                        ),
                    ]
                )
            ),
            new Model\LabeledThingInFrame(
                $thing,
                3,
                [],
                $this->convertShapesToArray(
                    [
                        new Shapes\Cuboid3d(
                            'test-1',
                            [12, 8.5, 3.7],
                            [12, 6.8, 3.7],
                            [12, 6.8, 2],
                            [12, 7.5, 2],
                            [20, 7.5, 3.7],
                            [20, 6.8, 3.7],
                            [20, 6.8, 2],
                            [20, 8.5, 2]
                        ),
                    ]
                )
            ),
        ];
        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    private function assertLabeledThingsInFrameAreEqual(array $expected, array $actual)
    {
        $this->assertEquals($this->createComparableArray($expected), $this->createComparableArray($actual));
    }

    private function createComparableArray(array $labeledThingsInFrame)
    {
        return array_map(
            function ($labeledThingInFrame) {
                return [
                    'frameIndex' => $labeledThingInFrame->getFrameIndex(),
                    'shapes'     => $labeledThingInFrame->getShapes(),
                ];
            },
            $labeledThingsInFrame
        );
    }

    private function convertShapesToArray(array $shapes)
    {
        return array_map(
            function ($shape) {
                return $shape->toArray();
            },
            $shapes
        );
    }

    /**
     * @param Model\LabeledThing $labeledThing
     * @param                    $frameIndex
     * @param array              $shapes
     *
     * @return Model\LabeledThingInFrame
     */
    private function createLabeledThingInFrame(Model\LabeledThing $labeledThing, $frameIndex, array $shapes = [])
    {
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameIndex);
        $labeledThingInFrame->setShapes($this->convertShapesToArray($shapes));
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }

    /**
     * @return Model\LabeledThing
     */
    private function createLabeledThing($endFrameIndex = 10)
    {
        return $this->labeledThingFacade->save(Model\LabeledThing::create($this->createTask($endFrameIndex)));
    }

    /**
     * @return Model\LabelingTask
     */
    private function createTask($endFrameIndex = 10)
    {
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));
        $video = Model\Video::create($organisation, 'Testvideo');
        $this->calibrationFileConverter->setCalibrationData(__DIR__ . '/Calibration/Video.csv');

        $calibrationData = new Model\CalibrationData($organisation, 'Testvideo');
        $calibrationData->setRawCalibration($this->calibrationFileConverter->getRawData());
        $calibrationData->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
        $calibrationData->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
        $calibrationData->setTranslation($this->calibrationFileConverter->getTranslation());
        $calibrationData->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());

        $this->calibrationDataFacade->save($calibrationData);
        $video->setCalibrationId($calibrationData->getId());
        $video = $this->videoFacade->save($video);

        return $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $video,
                $this->projectFacade->save(Model\Project::create('test project', $organisation)),
                range(1, $endFrameIndex),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
    }
}
