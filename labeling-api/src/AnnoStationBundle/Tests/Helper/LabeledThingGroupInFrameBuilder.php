<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model as AppBundleModel;
use AnnoStationBundle\Model;

/**
 * Helper class to create LabeledThingBuilder.
 */
class LabeledThingGroupInFrameBuilder
{
    /**
     * @var AppBundleModel\LabelingTask
     */
    private $labelingTask;

    /**
     * @var Model\LabeledThingGroup
     */
    private $labeledThingGroup;

    /**
     * @var integer
     */
    private $frameIndex;

    /**
     * @var array
     */
    private $classes = [];

    private function __construct(
        AppBundleModel\LabelingTask $task,
        Model\LabeledThingGroup $labeledThingGroup,
        $frameIndex
    )
    {
        $this->labelingTask      = $task;
        $this->labeledThingGroup = $labeledThingGroup;
        $this->frameIndex        = $frameIndex;
    }

    /**
     * @param AppBundleModel\LabelingTask    $task
     * @param Model\LabeledThingGroup        $labeledThingGroup
     * @param integer                        $frameIndex
     *
     * @return LabeledThingGroupInFrameBuilder
     */
    public static function create(
        AppBundleModel\LabelingTask $task,
        Model\LabeledThingGroup $labeledThingGroup,
        $frameIndex
    )
    {
        return new self($task, $labeledThingGroup, $frameIndex);
    }

    /**
     * @param array $classes
     *
     * @return $this
     */
    public function withClasses(array $classes)
    {
        $this->classes = $classes;

        return $this;
    }

    /**
     * @return Model\LabeledThingGroupInFrame
     */
    public function build()
    {
        $labeledThingGroupInFrame = new Model\LabeledThingGroupInFrame($this->labelingTask, $this->labeledThingGroup, $this->frameIndex);

        $labeledThingGroupInFrame->setClasses($this->classes);

        return $labeledThingGroupInFrame;
    }
}
