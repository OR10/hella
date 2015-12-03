<?php

namespace AppBundle\Tests\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Tests;

class InterpolationTest extends Tests\KernelTestCase
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
     * @var Service\Interpolation
     */
    private $interpolationService;

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnoService('database.facade.video');
        $this->labelingTaskFacade        = $this->getAnnoService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnoService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnoService('database.facade.labeled_thing_in_frame');
        $this->interpolationService      = $this->getAnnoService('service.interpolation');
    }

    private function getAnnoService($name)
    {
        return $this->getService(sprintf('annostation.labeling_api.%s', $name));
    }

    private function getService($name)
    {
        return static::$kernel->getContainer()->get($name);
    }

    public function testInterpolateSetsErrorStatusWhenUnknownAlgorithmShouldBeUsed()
    {
        $status = new Model\Interpolation\Status();
        $this->interpolationService->interpolate('foo', $this->createLabeledThing(), $status);

        $this->assertEquals(Model\Interpolation\Status::ERROR, $status->getStatus());
    }

    public function testEmittedLabeledThingsInFrameArePersisted()
    {
        $status = new Model\Interpolation\Status();
        $labeledThing = $this->createLabeledThing();
        $labeledThingsInFrame = [];

        foreach (range(3, 4) as $frameNumber) {
            $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
            $labeledThingInFrame->setFrameNumber($frameNumber);
            $labeledThingsInFrame[] = $labeledThingInFrame;
        }

        $algorithm = $this->getMockBuilder(Service\Interpolation\Algorithm::class)->getMock();
        $algorithm->method('getName')->willReturn('test');
        $algorithm->method('interpolate')->will(
            $this->returnCallback(function($labeledThing, $frameRange, $emit) use (&$labeledThingsInFrame, $status) {
                $this->assertEquals(Model\Interpolation\Status::RUNNING, $status->getStatus());
                foreach ($labeledThingsInFrame as $labeledThingInFrame) {
                    $emit($labeledThingInFrame);
                }
            })
        );

        $this->interpolationService->addAlgorithm($algorithm);
        $this->interpolationService->interpolate('test', $labeledThing, $status);

        $result = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing, 3, 0, 2);

        $this->assertEquals($labeledThingsInFrame, $result);
        $this->assertEquals(Model\Interpolation\Status::SUCCESS, $status->getStatus());
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
}
