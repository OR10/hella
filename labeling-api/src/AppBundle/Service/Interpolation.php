<?php

namespace AppBundle\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service\Interpolation;

/**
 * Service to interpolate the shapes of a `LabeledThing` for a given frame
 * range.
 *
 * The `LabeledThing` may contain any number of already existing
 * `LabeledThingInFrame`s which can and should be used by the algorithm
 * imlementation to create the missing `LabeledThingInFrame`s for the frames
 * that don't have any `LabeledThingInFrame` yet.
 */
class Interpolation
{
    /**
     * @var Interpolation\Algorithm[]
     */
    private $algorithms = [];

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @param Facade\LabeledThingInFrame
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    /**
     * Add new interpolation algorithm.
     *
     * @param Interpolation\Algorithm
     */
    public function addAlgorithm(Interpolation\Algorithm $algorithm)
    {
        if (isset($this->algorithms[$algorithm->getName()])) {
            throw new Interpolation\Exception("Algorithm with name '{$algorithm->getName()}' already exsists");
        }

        $this->algorithms[$algorithm->getName()] = $algorithm;
    }

    /**
     * @param string $algorithmName
     *
     * @return Interpolation\Algorithm
     */
    public function getAlgorithm($name)
    {
        if (!isset($this->algorithms[(string) $name])) {
            throw new Interpolation\Exception("Unknown algorithm '{$name}'");
        }

        return $this->algorithms[(string) $name];
    }

    /**
     * Interpolate for the whole frame range of the given `$labeledThing` using
     * the algorithm identified by `$algorithmName`.
     * The algorithm has to be added with `addAlgorithm` first.
     *
     * @param string             $algorithmName
     * @param Model\LabeledThing $labeledThing
     */
    public function interpolate($algorithmName, Model\LabeledThing $labeledThing)
    {
        $this->interpolateForRange($algorithmName, $labeledThing, $labeledThing->getFrameRange());
    }

    /**
     * Interpolate for the given `$frameRange` and `$labeledThing` using the
     * algorithm identified by `$algorithmName`.
     * The algorithm has to be added with `addAlgorithm` first.
     *
     * @param string             $algorithmName
     * @param Model\LabeledThing $labeledThing
     * @param Model\FrameRange   $frameRange
     */
    public function interpolateForRange(
        $algorithmName,
        Model\LabeledThing $labeledThing,
        Model\FrameRange $frameRange
    ) {
        $algorithm = $this->getAlgorithm($algorithmName);

        $labeledThingsInFrame = [];

        $algorithm->interpolate(
            $labeledThing,
            $frameRange,
            function(Model\LabeledThingInFrame $labeledThingInFrame) use (&$labeledThingsInFrame) {
                // TODO: make the number configurable
                if (count($labeledThingsInFrame) == 10) {
                    $this->persistLabeledThingsInFrame($labeledThingsInFrame);
                    $labeledThingsInFrame = [];
                } else {
                    $labeledThingsInFrame[] = $labeledThingInFrame;
                }
            }
        );

        if (!empty($labeledThingsInFrame)) {
            $this->persistLabeledThingsInFrame($labeledThingsInFrame);
        }
    }

    /**
     * FIXME: improve performance with bulk insert/update
     */
    private function persistLabeledThingsInFrame(array $labeledThingsInFrame)
    {
        foreach ($labeledThingsInFrame as $labeledThingInFrame) {
            $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        }
    }
}
