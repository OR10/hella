<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Tests\Helper\LabeledThingGroupBuilder;
use AnnoStationBundle\Tests\Helper\LabeledThingGroupInFrameBuilder;
use AnnoStationBundle\Tests\Helper\LabelingTaskBuilder;
use AnnoStationBundle\Tests\Helper\OrganisationBuilder;
use AnnoStationBundle\Tests\Helper\ProjectBuilder;
use AnnoStationBundle\Tests\Helper\VideoBuilder;
use AnnoStationBundle\Tests\KernelTestCase;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Service;

class GhostLabeledThingGroupInFrameClassesPropagationTest extends KernelTestCase
{
    /**
     * @var Service\GhostLabeledThingGroupInFrameClassesPropagation
     */
    private $ghostLabeledThingGroupInFrameClassesPropagation;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var AnnoStationBundleModel\LabeledThingGroup
     */
    private $labeledThingGroup;

    public function setUpImplementation()
    {
        $organisation      = OrganisationBuilder::create()->build();
        $project           = ProjectBuilder::create($organisation)->build();
        $video             = VideoBuilder::create($organisation)->build();

        $this->task              = LabelingTaskBuilder::create($project, $video)->build();
        $this->labeledThingGroup = LabeledThingGroupBuilder::create($this->task)->build();


        $this->ghostLabeledThingGroupInFrameClassesPropagation = $this->getAnnostationService(
            'service.ghost_labeled_thing_group_in_frame_classes_propagation'
        );
    }

    public function testGhostedThingGroupInFrameService()
    {
        $ghostedLabeledThingGroupInFrames = $this->ghostLabeledThingGroupInFrameClassesPropagation->propagateGhostClasses(
            $this->task,
            $this->createLabeledThingGroupInFrames()
        );

        $this->assertEquals(
            [
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 1)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 2)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 3)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 4)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 5)->withClasses(['foo1', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 6)->withClasses(['foo1', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 7)->withClasses(['foo1', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 8)->withClasses(['foo1', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 9)->withClasses(['foo1', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 10)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 11)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 12)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 13)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 14)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
                LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 15)->withClasses(['foo1'])->build(),
            ],
            array_values($ghostedLabeledThingGroupInFrames));
    }

    private function createLabeledThingGroupInFrames()
    {
        return [
            LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 1)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
            LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 5)->withClasses(['foo1', 'foo3'])->build(),
            LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 10)->withClasses(['foo1', 'foo2', 'foo3'])->build(),
            LabeledThingGroupInFrameBuilder::create($this->task, $this->labeledThingGroup, 15)->withClasses(['foo1'])->build(),
        ];
    }
}