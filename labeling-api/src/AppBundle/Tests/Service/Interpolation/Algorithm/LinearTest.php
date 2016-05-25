<?php

namespace AppBundle\Tests\Service\Interpolation\Algorithm;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AppBundle\Service;
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

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->algorithm                 = $this->getAnnostationService('service.interpolation.algorithm.linear');
        $this->calibrationFileConverter  = $this->getAnnostationService('service.calibration_file_converter');
    }

    /**
     * @expectedException AppBundle\Service\Interpolation\Exception
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
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                7,
                [
                    new Shapes\Rectangle('test-1', 8, 8, 20, 20),
                    new Shapes\Rectangle('test-2', 200, 200, 100, 100),
                    new Shapes\Ellipse('test-3', 200, 200, 100, 100),
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
                $thing, 3, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                    new Shapes\Rectangle('test-2', 100, 100, 200, 200),
                    new Shapes\Ellipse('test-3', 100, 100, 200, 200),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 4, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 5.75, 5.75, 12.5, 12.5),
                    new Shapes\Rectangle('test-2', 125, 125, 175, 175),
                    new Shapes\Ellipse('test-3', 125, 125, 175, 175),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 5, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 6.5, 6.5, 15, 15),
                    new Shapes\Rectangle('test-2', 150, 150, 150, 150),
                    new Shapes\Ellipse('test-3', 150, 150, 150, 150),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 6, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 7.25, 7.25, 17.5, 17.5),
                    new Shapes\Rectangle('test-2', 175, 175, 125, 125),
                    new Shapes\Ellipse('test-3', 175, 175, 125, 125),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 7, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 8, 8, 20, 20),
                    new Shapes\Rectangle('test-2', 200, 200, 100, 100),
                    new Shapes\Ellipse('test-3', 200, 200, 100, 100),
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
                1,
                [
                    new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                5,
                [
                    new Shapes\Rectangle('test-1', 10, 10, 20, 20),
                ]
            ),
            $this->createLabeledThingInFrame(
                $thing,
                10,
                [
                    new Shapes\Rectangle('test-1', 5, 5, 30, 30),
                ]
            ),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 10),
            function (Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame(
                $thing, 1, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 2, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 6.25, 6.25, 12.5, 12.5),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 3, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 7.5, 7.5, 15, 15),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 4, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 8.75, 8.75, 17.5, 17.5),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 5, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 10, 10, 20, 20),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 6, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 9, 9, 22, 22),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 7, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 8, 8, 24, 24),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 8, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 7, 7, 26, 26),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 9, [], $this->convertShapesToArray(
                [
                    new Shapes\Rectangle('test-1', 6, 6, 28, 28),
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 10, [], $this->convertShapesToArray(
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
            )
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
                $thing, 1, [], $this->convertShapesToArray(
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
                    )
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 2, [], $this->convertShapesToArray(
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
                    )
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 3, [], $this->convertShapesToArray(
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
                    )
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
            )
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
                $thing, 1, [], $this->convertShapesToArray(
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
                    )
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 2, [], $this->convertShapesToArray(
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
                    )
                ]
            )
            ),
            new Model\LabeledThingInFrame(
                $thing, 3, [], $this->convertShapesToArray(
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
                    )
                ]
            )
            ),
        ];
        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testCuboid3dInterpolationWith2d()
    {
        $thing = $this->createLabeledThing();
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
            )
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
                $thing, 1, [], $this->convertShapesToArray(
                [
                    new Shapes\Cuboid3d(
                        'test-1',
                        [20, 1, 1],
                        [20, -1, 1],
                        [20, -1, 0],
                        [20, 1, 0],
                        [24, 1, 1],
                        [24, -1, 1],
                        [24, -1, 0
                        ],
                        [24, 1, 0]
                    )
                ])
            ),
            new Model\LabeledThingInFrame(
                $thing, 2, [], $this->convertShapesToArray(
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
                    )
                ])
            ),
            new Model\LabeledThingInFrame(
                $thing, 3, [], $this->convertShapesToArray(
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
                    )
                ])
            ),
            new Model\LabeledThingInFrame(
                $thing, 4, [], $this->convertShapesToArray(
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
                    )
                ])
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
        $video = Model\Video::create('Testvideo');
        $this->calibrationFileConverter->setCalibrationData(__DIR__ . '/Calibration/Video.csv');
        $video->setRawCalibration($this->calibrationFileConverter->getRawData());
        $video->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
        $video->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
        $video->setTranslation($this->calibrationFileConverter->getTranslation());
        $video->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());

        $video = $this->videoFacade->save($video);

        return $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $video,
                $this->projectFacade->save(Model\Project::create('test project')),
                range(1, $endFrameIndex),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
    }
}
