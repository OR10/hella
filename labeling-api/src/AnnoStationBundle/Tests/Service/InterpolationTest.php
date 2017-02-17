<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Service;
use AppBundle\Tests;

class InterpolationTest extends Tests\KernelTestCase
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
     * @var Service\Interpolation
     */
    private $interpolationService;

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
        $this->organisationFacade        = $this->getAnnostationService('database.facade.organisation');
        $this->interpolationService      = $this->getAnnostationService('service.interpolation');
    }

    /**
     * @expectedException AnnoStationBundle\Service\Interpolation\Exception
     */
    public function testInterpolateSetsErrorStatusWhenUnknownAlgorithmShouldBeUsed()
    {
        $status = new Model\Interpolation\Status();
        $this->interpolationService->interpolate('foo', $this->createLabeledThing(), $status);
    }

    public function testEmittedLabeledThingsInFrameArePersisted()
    {
        $status               = new Model\Interpolation\Status();
        $labeledThing         = $this->createLabeledThing();
        $labeledThingsInFrame = [];

        foreach (range(3, 4) as $frameIndex) {
            $labeledThingInFrame    = new Model\LabeledThingInFrame($labeledThing, $frameIndex);
            $labeledThingsInFrame[] = $labeledThingInFrame;
        }

        $algorithm = $this->getMockBuilder(Service\Interpolation\Algorithm::class)->getMock();
        $algorithm->method('getName')->willReturn('test');
        $algorithm->method('interpolate')->will(
            $this->returnCallback(
                function ($labeledThing, $frameRange, $emit) use (&$labeledThingsInFrame, $status) {
                    foreach ($labeledThingsInFrame as $labeledThingInFrame) {
                        $emit($labeledThingInFrame);
                    }
                }
            )
        );

        $this->interpolationService->addAlgorithm($algorithm);
        $this->interpolationService->interpolate('test', $labeledThing, $status);

        $result = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing, 3, 0, 2);

        $this->assertEquals($labeledThingsInFrame, $result);
    }

    /**
     * @return Model\LabeledThing
     */
    private function createLabeledThing()
    {
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));
        $task = $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->videoFacade->save(Model\Video::create($organisation, 'Testvideo')),
                $this->projectFacade->save(Model\Project::create('test project', $organisation)),
                range(1, 10),
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );

        return $this->labeledThingFacade->save(Model\LabeledThing::create($task));
    }
}
