<?php

namespace AppBundle\Tests\Service;

use AppBundle\Tests\KernelTestCase;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;

class GhostClassesPropagationTest extends KernelTestCase
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacadeMock;

    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagationService;

    /**
     * @var Model\LabeledThingInFrame[]
     */
    private $labeledThingsInFrame;

    /**
     * @var Model\Video
     */
    private $video;
    
    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\LabeledThing
     */
    private $labeledThingOne;

    /**
     * @var Model\LabeledThing
     */
    private $labeledThingTwo;

    /**
     * Initialize test environment before each test
     */
    public function setUpImplementation()
    {
        $this->setUpLabeledThingsInFrame();

        $container = $this->getContainer();

        $this->labeledThingInFrameFacadeMock = $this->getMockBuilder('AppBundle\Database\Facade\LabeledThingInFrame')
            ->disableOriginalConstructor()
            ->getMock();

        $container->set(
            sprintf(self::ANNOSTATION_SERVICE_PATTERN, 'database.facade.labeled_thing_in_frame'),
            $this->labeledThingInFrameFacadeMock
        );

        $this->ghostClassesPropagationService = $this->getAnnostationService('service.ghost_classes_propagation');
    }

    public function testPropagationIsDelegatedToFacade()
    {
        $this->labeledThingInFrameFacadeMock
            ->expects($this->atLeastOnce())
            ->method('getPreviousLabeledThingInFrameWithClasses')
            ->with($this->anything());

        $this->ghostClassesPropagationService->propagateGhostClasses($this->labeledThingsInFrame);
    }

    public function testPropagationDoesNotMutateInput()
    {
        $labeledThingsInFrameWithGhostClasses = $this->ghostClassesPropagationService->propagateGhostClasses(
            $this->labeledThingsInFrame
        );

        foreach ($labeledThingsInFrameWithGhostClasses as $key => $value) {
            $this->assertNotContains($value, $this->labeledThingsInFrame);
        }
    }

    public function testPropagationIsProperlyCached()
    {
        $this->labeledThingInFrameFacadeMock
            ->expects($this->once())
            ->method('getPreviousLabeledThingInFrameWithClasses')
            ->with($this->anything());

        $labeledThingsInFrameWithGhostClasses = $this->ghostClassesPropagationService->propagateGhostClasses(
            $this->labeledThingsInFrame
        );
    }

    public function testPropagationIsProperlyExecuted()
    {
        $this->labeledThingInFrameFacadeMock
            ->method('getPreviousLabeledThingInFrameWithClasses')
            ->will(
                $this->returnValue(
                    Model\LabeledThingInFrame::create($this->labeledThingTwo, 50, array('propagated'))
                )
            );
        
        $this->labeledThingInFrameFacadeMock
            ->expects($this->once())
            ->method('getPreviousLabeledThingInFrameWithClasses')
            ->with($this->anything());


        $labeledThingsInFrameWithGhostClasses = $this->ghostClassesPropagationService->propagateGhostClasses(
            $this->labeledThingsInFrame
        );

        $expectedClasses = array(
            ['classes' => ['some', 'classes'], 'ghostClasses' => null],
            ['classes' => [], 'ghostClasses' => ['some', 'classes']],
            ['classes' => [], 'ghostClasses' => ['some', 'classes']],
            ['classes' => ['some', 'other', 'classes'], 'ghostClasses' => null],
            ['classes' => [], 'ghostClasses' => ['some', 'other', 'classes']],
            ['classes' => ['completely', 'different'], 'ghostClasses' => null],

            ['classes' => [], 'ghostClasses' => ['propagated']],
            ['classes' => [], 'ghostClasses' => ['propagated']],
            ['classes' => ['a class'], 'ghostClasses' => null],
            ['classes' => [], 'ghostClasses' => ['a class']],
            ['classes' => ['foo', 'bar'], 'ghostClasses' => null],
        );

        foreach ($labeledThingsInFrameWithGhostClasses as $key => $labeledThingInFrameWithGhostClasses) {
            $this->assertEquals(
                $expectedClasses[$key]['classes'],
                $labeledThingInFrameWithGhostClasses->getClasses(),
                sprintf(
                    'Wrong classes for frame %s (index %d). Expected %s, got %s',
                    $labeledThingInFrameWithGhostClasses->getFrameIndex(),
                    $key,
                    var_export($expectedClasses[$key]['classes'], true),
                    var_export($labeledThingInFrameWithGhostClasses->getClasses(), true)
                )
            );
            $this->assertEquals(
                $expectedClasses[$key]['ghostClasses'],
                $labeledThingInFrameWithGhostClasses->getGhostClasses(),
                sprintf(
                    'Wrong ghostClasses for frame %s (index %d). Expected %s, got %s',
                    $labeledThingInFrameWithGhostClasses->getFrameIndex(),
                    $key,
                    var_export($expectedClasses[$key]['ghostClasses'], true),
                    var_export($labeledThingInFrameWithGhostClasses->getGhostClasses(), true)
                )
            );
        }
    }

    /**
     * Setup the needed LabeledThingsInFrame for all of the testing
     */
    private function setUpLabeledThingsInFrame()
    {
        $this->video           = Model\Video::create('some video');
        $this->project           = Model\Project::create('test project');
        $this->task            = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(1, 200),
            'object-labeling'
        );
        $this->labeledThingOne = Model\LabeledThing::create($this->task)->setId('labeled-thing-one');
        $this->labeledThingTwo = Model\LabeledThing::create($this->task)->setId('labeled-thing-two');

        $this->labeledThingsInFrame = array(
            Model\LabeledThingInFrame::create($this->labeledThingOne, 1, array('some', 'classes')),
            Model\LabeledThingInFrame::create($this->labeledThingOne, 4, array())->setGhost(true),
            Model\LabeledThingInFrame::create($this->labeledThingOne, 5, array()),
            Model\LabeledThingInFrame::create($this->labeledThingOne, 10, array('some', 'other', 'classes')),
            Model\LabeledThingInFrame::create($this->labeledThingOne, 15, array()),
            Model\LabeledThingInFrame::create($this->labeledThingOne, 20, array('completely', 'different')),

            // The following LabeledThingsInFrame are out of order to test correct cache handling
            Model\LabeledThingInFrame::create($this->labeledThingTwo, 190, array('a class')),
            Model\LabeledThingInFrame::create($this->labeledThingTwo, 100, array()),
            Model\LabeledThingInFrame::create($this->labeledThingTwo, 195, array()),
            Model\LabeledThingInFrame::create($this->labeledThingTwo, 200, array('foo', 'bar')),
            Model\LabeledThingInFrame::create($this->labeledThingTwo, 130, array()),
        );
    }
}
