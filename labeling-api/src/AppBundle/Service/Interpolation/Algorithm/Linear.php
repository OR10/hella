<?php

namespace AppBundle\Service\Interpolation\Algorithm;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service\Interpolation;

class Linear implements Interpolation\Algorithm
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @param Facade\LabeledThing
     */
    public function __construct(
        Facade\LabeledThing $labeledThingFacade
    ) {
        $this->labeledThingFacade = $labeledThingFacade;
    }

    public function getName()
    {
        return 'linear';
    }

    public function interpolate(
        Model\LabeledThing $labeledThing,
        Model\FrameRange $frameRange,
        callable $emit
    ) {
        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $frameRange->getStartFrameNumber(),
            0,
            $frameRange->getNumberOfFrames()
        )->toArray();

        if (empty($labeledThingsInFrame)) {
            throw new Interpolation\Exception('Insufficient labeled things in frame');
        }

        $this->clonePrecedingLabeledThingsInFrame(
            $frameRange->getStartFrameNumber(),
            $labeledThingsInFrame[0],
            $emit
        );

        while (count($labeledThingsInFrame) > 1) {
            $current = array_shift($labeledThingsInFrame);
            $emit($current);
            $this->doInterpolate($current, $labeledThingsInFrame[0], $emit);
        }

        $emit($labeledThingsInFrame[0]);

        $this->cloneSubsequentLabeledThingsInFrame(
            $labeledThingsInFrame[0],
            $frameRange->getEndFrameNumber(),
            $emit
        );
    }

    private function doInterpolate(
        Model\LabeledThingInFrame $start,
        Model\LabeledThingInFrame $end,
        callable $emit
    ) {
        if ($end->getFrameNumber() - $start->getFrameNumber() < 2) {
            // nothing to when there is no frame in between
            return;
        }

        foreach (range($start->getFrameNumber() + 1, $end->getFrameNumber() - 1) as $frameNumber) {
            $clone = $start->copy();
            $clone->setFrameNumber($frameNumber);
            $emit($clone);
        }
    }

    private function clonePrecedingLabeledThingsInFrame(
        $startFrameNumber,
        Model\LabeledThingInFrame $labeledThingInFrame,
        callable $emit
    ) {
        if ($startFrameNumber >= $labeledThingInFrame->getFrameNumber()) {
            return;
        }

        foreach (range($startFrameNumber, $labeledThingInFrame->getFrameNumber() - 1) as $frameNumber) {
            $clone = $labeledThingInFrame->copy();
            $clone->setFrameNumber($frameNumber);
            $emit($clone);
        }
    }

    private function cloneSubsequentLabeledThingsInFrame(
        Model\LabeledThingInFrame $labeledThingInFrame,
        $endFrameNumber,
        callable $emit
    ) {
        if ($endFrameNumber <= $labeledThingInFrame->getFrameNumber()) {
            return;
        }

        foreach (range($labeledThingInFrame->getFrameNumber() + 1, $endFrameNumber) as $frameNumber) {
            $clone = $labeledThingInFrame->copy();
            $clone->setFrameNumber($frameNumber);
            $emit($clone);
        }
    }
}
