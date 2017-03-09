<?php
namespace AnnoStationBundle\Tests\Helper\Iterator;

use AnnoStationBundle\Helper\Iterator;
use AppBundle\Model;
use AnnoStationBundle\Tests;

class LabeledThingInFrameIteratorTest extends Tests\CouchDbTestCase
{
    /**
     * @var Model\LabelingTask
     */
    private $firstTask;

    /**
     * @var Model\LabelingTask
     */
    private $secondTask;

    /**
     * @var Model\LabeledThingInFrame[]
     */
    private $firstTaskLtifs;

    /**
     * @var Model\LabeledThingInFrame[]
     */
    private $secondTaskLtifs;

    private function createIterator(Model\LabelingTask $task)
    {
        $ghostClassesPropagationService = $this->getAnnostationService('service.ghost_classes_propagation');

        return new Iterator\LabeledThingInFrame(
            $this->labeledThingInFrameFacade,
            $task,
            $ghostClassesPropagationService
        );
    }

    public function setUpImplementation()
    {
        parent::setUpImplementation();

        $video   = $this->createVideo($this->createOrganisation(), 'video-id-1');
        $project = $this->createProject('project-id-1', $this->createOrganisation());

        $this->firstTaskLtifs  = array();
        $this->secondTaskLtifs = array();

        $this->firstTask                    = $this->createTask($project, $video);
        $firstTaskfirstLabeledThingInFrame  = $this->createLabeledThing($this->firstTask);
        $this->firstTaskLtifs[]             = $this->createLabeledThingInFrame($firstTaskfirstLabeledThingInFrame, 1);
        $this->firstTaskLtifs[]             = $this->createLabeledThingInFrame($firstTaskfirstLabeledThingInFrame, 4);
        $firstTasksecondLabeledThingInFrame = $this->createLabeledThing($this->firstTask);
        $this->firstTaskLtifs[]             = $this->createLabeledThingInFrame($firstTasksecondLabeledThingInFrame, 5);

        $this->secondTask                   = $this->createTask($project, $video);
        $secondTaskfirstLabeledThingInFrame = $this->createLabeledThing($this->secondTask);
        $this->secondTaskLtifs[]            = $this->createLabeledThingInFrame($secondTaskfirstLabeledThingInFrame, 3);
    }

    public function testImplementsTraversable()
    {
        $iterator = $this->createIterator($this->firstTask);
        $this->assertSame(
            true,
            $iterator instanceof \Traversable
        );
    }

    public function testIteratesOneLtWithOneLtif()
    {
        $iterator = $this->createIterator($this->secondTask);
        $ltifs    = array();
        foreach ($iterator as $ltif) {
            $ltifs[] = $ltif;
        }

        $this->assertEquals(
            $this->secondTaskLtifs,
            $ltifs
        );
    }

    public function testIteratesMultipleLtWithMultipleLtifs()
    {
        $iterator = $this->createIterator($this->firstTask);
        $ltifs    = array();
        foreach ($iterator as $ltif) {
            $ltifs[] = $ltif;
        }

        $this->assertEquals(
            $this->firstTaskLtifs,
            $ltifs
        );
    }
}
