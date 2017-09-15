<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model as AppBundleModel;
use AnnoStationBundle\Model;

/**
 * Helper class to create LabeledThingBuilder.
 */
class LabeledThingGroupBuilder
{
    /**
     * @var AppBundleModel\LabelingTask
     */
    private $labelingTask;

    /**
     * @var string
     */
    private $groupType;

    private function __construct(AppBundleModel\LabelingTask $task)
    {
        $this->labelingTask = $task;
    }

    /**
     * @param AppBundleModel\LabelingTask $task
     * @return LabeledThingGroupBuilder
     */
    public static function create(AppBundleModel\LabelingTask $task)
    {
        return new self($task);
    }

    /**
     * @param $groupType
     * @return $this
     */
    public function withGroupType($groupType)
    {
        $this->groupType = $groupType;

        return $this;
    }

    /**
     * @return Model\LabeledThingGroup
     */
    public function build()
    {
        $labeledThingGroup = new Model\LabeledThingGroup($this->labelingTask, 1, $this->groupType);

        return $labeledThingGroup;
    }
}
