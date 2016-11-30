<?php

namespace AnnoStationBundle\Service\Interpolation;

use AppBundle\Model;

/**
 * Interface of an interpolation algorithm.
 *
 * An algorithm is identified by its name which has to be unique throughout all
 * algorithms that are added to one interpolation service.
 *
 * The algorithm gets an instance of `LabeledThing` and a `FrameRange` for
 * which it is expected to interpolate the missing `LabeledThingInFrame` for
 * frames which do not already have a `LabeledThingInFrame`.
 *
 * It doesn't matter in which order the interpolation is actually performed.
 * So, one algorithm may interpolate from the beginning to the end while
 * another algorithm may interpolate randomly or whatever makes sense for the
 * algorithm.
 *
 * The `interpolate` method takes a `callable` object which is expected to be
 * invoked for each new or modified `LabeledThingInFrame`. This way, we can
 * simply emit changes without worrying about persisting the changes within the
 * algorithm. We explicitly don't want to return these `LabeledThingInFrame`
 * instances because there may be many of them which could exceed memory
 * boundaries. By using a callback, the invoking service may implement any
 * strategy for persisting the changes and may cache intermediate results for
 * bulk updates or whatever.
 */
interface Algorithm
{
    /**
     * Get the (unique) name of the algorithm.
     *
     * @return string
     */
    public function getName();

    /**
     * Interpolate `LabeledThingInFrame`s for the given `$labeledThing` and
     * `$frameRange`.
     * The implementation is expected to invoke `$emit` for each new or
     * modified `LabeledThingInFrame`.
     *
     * @param Model\LabeledThing    $labeledThing
     * @param Model\FrameIndexRange $frameRange
     * @param callable              $emit
     */
    public function interpolate(Model\LabeledThing $labeledThing, Model\FrameIndexRange $frameRange, callable $emit);
}
