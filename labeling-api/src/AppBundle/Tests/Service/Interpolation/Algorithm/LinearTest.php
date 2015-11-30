<?php

namespace AppBundle\Tests\Service\Interpolation\Algorithm;

use AppBundle\Database\Facade;
use AppBundle\Model;
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
        $this->videoFacade               = $this->getAnnoService('database.facade.video');
        $this->labelingTaskFacade        = $this->getAnnoService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnoService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnoService('database.facade.labeled_thing_in_frame');
        $this->algorithm                 = $this->getAnnoService('service.interpolation.algorithm.linear');
    }

    private function getAnnoService($name)
    {
        return $this->getService(sprintf('annostation.labeling_api.%s', $name));
    }

    private function getService($name)
    {
        return static::$kernel->getContainer()->get($name);
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
            $this->createRectangleShape(5, 5, 10, 10),
        ]);

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameRange(1, 1),
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
                $this->createRectangleShape(5, 5, 10, 10),
            ]),
            $this->createLabeledThingInFrame($thing, 2, [
                    $this->createRectangleShape(5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameRange(1, 2),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $this->assertLabeledThingsInFrameAreEqual($thingsInFrame, $emitted);
    }

    public function testInterpolationClonesFirstFoundLabeledThingInFrameWhenStartFrameIsLowerThanFoundFrameNumber()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 3, [
                $this->createRectangleShape(5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameRange(1, 3),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function($frameNumber) use ($thingsInFrame) {
                $clone = $thingsInFrame[0]->copy();
                $clone->setFrameNumber($frameNumber);
                return $clone;
            },
            range(1, 3)
        );

        $this->assertLabeledThingsInFrameAreEqual($expected, $emitted);
    }

    public function testInterpolationClonesLastFoundLabeledThingInFrameWhenEndFrameIsGreaterThanFoundFrameNumber()
    {
        $thing = $this->createLabeledThing();
        $thingsInFrame = [
            $this->createLabeledThingInFrame($thing, 3, [
                $this->createRectangleShape(5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameRange(3, 10),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function($frameNumber) use ($thingsInFrame) {
                $clone = $thingsInFrame[0]->copy();
                $clone->setFrameNumber($frameNumber);
                return $clone;
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
                $this->createRectangleShape(5, 5, 10, 10),
            ]),
            $this->createLabeledThingInFrame($thing, 7, [
                $this->createRectangleShape(5, 5, 10, 10),
            ]),
        ];

        $emitted = [];

        $this->algorithm->interpolate(
            $thing,
            new Model\FrameRange(3, 7),
            function(Model\LabeledThingInFrame $emittedLabeledThingInFrame) use (&$emitted) {
                $emitted[] = $emittedLabeledThingInFrame;
            }
        );

        $expected = array_map(
            function($frameNumber) use ($thingsInFrame) {
                $clone = $thingsInFrame[0]->copy();
                $clone->setFrameNumber($frameNumber);
                return $clone;
            },
            range(4, 6)
        );
        array_unshift($expected, $thingsInFrame[0]);
        $expected[] = $thingsInFrame[1];

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
                'frameNumber' => $labeledThingInFrame->getFrameNumber(),
                'shapes' => $labeledThingInFrame->getShapes(),
            ];
        }, $labeledThingsInFrame);
    }

    /**
     * @return Model\LabeledThingInFrame
     */
    private function createLabeledThingInFrame(
        Model\LabeledThing $labeledThing,
        $frameNumber,
        array $shapes = []
    ) {
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
        $labeledThingInFrame->setFrameNumber($frameNumber);
        $labeledThingInFrame->setShapes($shapes);
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        return $labeledThingInFrame;
    }

    /**
     * @return Model\LabeledThing
     */
    private function createLabeledThing()
    {
        $labeledThing = new Model\LabeledThing($this->createTask());
        $this->labeledThingFacade->save($labeledThing);
        return $labeledThing;
    }

    /**
     * @return Model\LabelingTask
     */
    private function createTask()
    {
        $task = new Model\LabelingTask($this->createVideo(), new Model\FrameRange(1, 10), []);
        $this->labelingTaskFacade->save($task);
        return $task;
    }

    /**
     * @return Model\Video
     */
    private function createVideo()
    {
        $video = new Model\Video('Testvideo');
        $this->videoFacade->save($video);
        return $video;
    }

    /**
     * @param float $left
     * @param float $top
     * @param float $right
     * @param float $bottom
     *
     * @return array
     */
    private function createRectangleShape($left, $top, $right, $bottom)
    {
        return [
            'type' => 'rectangle',
            'topLeft' => [
                'x' => (float) $left,
                'y' => (float) $top,
            ],
            'bottomRight' => [
                'x' => (float) $right,
                'y' => (float) $bottom,
            ],
        ];
    }
}
