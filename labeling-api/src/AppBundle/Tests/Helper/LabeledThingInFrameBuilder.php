<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;

/**
 * Helper class to create LabeledThingInFrame.
 */
class LabeledThingInFrameBuilder
{
    /**
     * @var array
     */
    private $classes = ['foobar1', 'foobar2'];

    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;

    /**
     * Declare a private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return LabeledThingInFrameBuilder
     */
    public static function create()
    {
        return new self();
    }

    public function withLabeledThing(Model\LabeledThing $labeledThing)
    {
        $this->labeledThing = $labeledThing;

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
     * @return Model\LabeledThingInFrame
     */
    public function build()
    {
        $labeledThingInFrame = Model\LabeledThingInFrame::create($this->labeledThing, 30, $this->classes);

        return $labeledThingInFrame;
    }
}