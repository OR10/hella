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

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->algorithm                 = $this->getAnnostationService('service.interpolation.algorithm.linear');
    }

    /**
     * @expectedException AppBundle\Service\Interpolation\Exception
     */
    public function testInterpolationWithoutAnyLabeledThingInFrameThrowsException()
    {
        $thing = $this->createLabeledThing();

        $this->algorithm->interpolate($thing, $thing->getFrameRange(), function() {});
    }

    public function testInterpolationWithASingleLabeledThingInFrameEmitsThisLabeledThingInFrame()
    {
        $thing = $this->createLabeledThing();
        $thingInFrame = $this->createLabeledThingInFrame($thing, 1, [
            new Shapes\Rectangle('test', 5, 5, 10, 10),
        ]);

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 1),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $this->assertLabeledThingsInFrameAreEqual([$thingInFrame], $emitted);
    }

    public function testInterpolationWithTwoLabeledThingsInFrameEmitsBothLabeledThingsInFrame()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 1, [
                new Shapes\Rectangle('test-1', 5, 5, 10, 10),
            ]),
            $this->createLabeledThingInFrame($thing, 2, [
                new Shapes\Rectangle('test-2', 5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 2),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $this->assertLabeledThingsInFrameAreEqual($thingsInFrame, $emitted);
    }

    public function testInterpolationClonesFirstFoundLabeledThingInFrameWhenStartFrameIsLowerThanFoundFrameIndex()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 3, [
                new Shapes\Rectangle('test-3', 5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 3),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function($frameIndex) use ($thingsInFrame) {
                return $thingsInFrame[0]->copy($frameIndex);
            },
            range(1, 3)
        );

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationClonesLastFoundLabeledThingInFrameWhenEndFrameIsGreaterThanFoundFrameIndex()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 3, [
                new Shapes\Rectangle('test-3', 5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(3, 10),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function($frameIndex) use ($thingsInFrame) {
                return $thingsInFrame[0]->copy($frameIndex);
            },
            range(3, 10)
        );

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationBetweenTwoLabeledThingsInFrameWithSameShapes()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 3, [
                new Shapes\Rectangle('test', 5, 5, 10, 10),
            ]),
            $this->createLabeledThingInFrame($thing, 7, [
                new Shapes\Rectangle('test', 5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(3, 7),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function($frameIndex) use ($thingsInFrame) {
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
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 3, [
                new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                new Shapes\Rectangle('test-2', 100, 100, 200, 200),
                new Shapes\Ellipse('test-3', 100, 100, 200, 200),
            ]),
            $this->createLabeledThingInFrame($thing, 7, [
                new Shapes\Rectangle('test-1', 8, 8, 20, 20),
                new Shapes\Rectangle('test-2', 200, 200, 100, 100),
                new Shapes\Ellipse('test-3', 200, 200, 100, 100),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(3, 7),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame($thing, 3, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 5, 5, 10, 10),
                new Shapes\Rectangle('test-2', 100, 100, 200, 200),
                new Shapes\Ellipse('test-3', 100, 100, 200, 200),
            ])),
            new Model\LabeledThingInFrame($thing, 4, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 5.75, 5.75, 12.5, 12.5),
                new Shapes\Rectangle('test-2', 125, 125, 175, 175),
                new Shapes\Ellipse('test-3', 125, 125, 175, 175),
            ])),
            new Model\LabeledThingInFrame($thing, 5, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 6.5, 6.5, 15, 15),
                new Shapes\Rectangle('test-2', 150, 150, 150, 150),
                new Shapes\Ellipse('test-3', 150, 150, 150, 150),
            ])),
            new Model\LabeledThingInFrame($thing, 6, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 7.25, 7.25, 17.5, 17.5),
                new Shapes\Rectangle('test-2', 175, 175, 125, 125),
                new Shapes\Ellipse('test-3', 175, 175, 125, 125),
            ])),
            new Model\LabeledThingInFrame($thing, 7, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 8, 8, 20, 20),
                new Shapes\Rectangle('test-2', 200, 200, 100, 100),
                new Shapes\Ellipse('test-3', 200, 200, 100, 100),
            ])),
        ];

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationWithWithMultipleExistingLabeledThingsInFrame()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 1, [
                new Shapes\Rectangle('test-1', 5, 5, 10, 10),
            ]),
            $this->createLabeledThingInFrame($thing, 5, [
                new Shapes\Rectangle('test-1', 10, 10, 20, 20),
            ]),
            $this->createLabeledThingInFrame($thing, 10, [
                new Shapes\Rectangle('test-1', 5, 5, 30, 30),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameIndexRange(1, 10),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = [
            new Model\LabeledThingInFrame($thing, 1, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 5, 5, 10, 10),
            ])),
            new Model\LabeledThingInFrame($thing, 2, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 6.25, 6.25, 12.5, 12.5),
            ])),
            new Model\LabeledThingInFrame($thing, 3, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 7.5, 7.5, 15, 15),
            ])),
            new Model\LabeledThingInFrame($thing, 4, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 8.75, 8.75, 17.5, 17.5),
            ])),
            new Model\LabeledThingInFrame($thing, 5, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 10, 10, 20, 20),
            ])),
            new Model\LabeledThingInFrame($thing, 6, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 9, 9, 22, 22),
            ])),
            new Model\LabeledThingInFrame($thing, 7, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 8, 8, 24, 24),
            ])),
            new Model\LabeledThingInFrame($thing, 8, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 7, 7, 26, 26),
            ])),
            new Model\LabeledThingInFrame($thing, 9, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 6, 6, 28, 28),
            ])),
            new Model\LabeledThingInFrame($thing, 10, [], $this->convertShapesToArray([
                new Shapes\Rectangle('test-1', 5, 5, 30, 30),
            ])),
        ];

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    private function assertLabeledThingsInFrameAreEqual(array $expected, array $actual)
    {
        $this->assertEquals($this->createComparableArray($expected), $this->createComparableArray($actual));
    }

    private function createComparableArray(array $labeledThingsInFrame)
    {
        return array_map(function($labeledThingInFrame) {
            return [
                'frameIndex' => $labeledThingInFrame->getFrameIndex(),
                'shapes' => $labeledThingInFrame->getShapes(),
            ];
        }, $labeledThingsInFrame);
    }

    private function convertShapesToArray(array $shapes)
    {
        return array_map(
            function($shape) {
                return $shape->toArray();
            },
            $shapes
        );
    }

    /**
     * @param Model\LabeledThing $labeledThing
     * @param $frameIndex
     * @param array $shapes
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
        $video = $this->videoFacade->save(Model\Video::create('Testvideo'));
        return $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $video,
                range(1, $endFrameIndex),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
    }
}
