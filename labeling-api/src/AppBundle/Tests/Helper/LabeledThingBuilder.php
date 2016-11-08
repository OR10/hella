<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;

/**
 * Helper class to create LabeledThingBuilder.
 */
class LabeledThingBuilder
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
     * Declare a private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return LabeledThingBuilder
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return $this
     */
    public function withTask(Model\LabelingTask $task)
    {
        $this->labelingTask = $task;

        return $this;
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
     * @return Model\LabeledThing
     */
    public function build()
    {
        $labeledThing = Model\LabeledThing::create($this->labelingTask);
        $labeledThing->setClasses($this->classes);

        return $labeledThing;
    }
}
