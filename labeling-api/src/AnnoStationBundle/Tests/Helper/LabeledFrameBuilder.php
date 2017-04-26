<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model;

/**
 * Helper class to create LabeledThingBuilder.
 */
class LabeledFrameBuilder
{
    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var array
     */
    private $classes = ['foobar1', 'foobar2', 'foobar3'];

    /**
     * @var int
     */
    private $frameIndex;

    /**
     * @var bool
     */
    private $incomplete = true;

    /**
     * Declare a private constructor to enforce usage of fluent interface.
     *
     * @param Model\LabelingTask $task
     * @param                    $frameIndex
     */
    private function __construct(Model\LabelingTask $task, $frameIndex)
    {
        $this->labelingTask = $task;
        $this->frameIndex   = $frameIndex;
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $frameIndex
     *
     * @return LabeledFrameBuilder
     */
    public static function create(Model\LabelingTask $task, $frameIndex)
    {
        return new self($task, $frameIndex);
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
     * @param $flag
     *
     * @return $this
     */
    public function withIncompleteFlag($flag)
    {
        $this->incomplete = $flag;

        return $this;
    }

    /**
     * @return Model\LabeledFrame
     */
    public function build()
    {
        $labeledThing = Model\LabeledFrame::create($this->labelingTask, $this->frameIndex);
        $labeledThing->setClasses($this->classes);
        $labeledThing->setIncomplete($this->incomplete);

        return $labeledThing;
    }
}
