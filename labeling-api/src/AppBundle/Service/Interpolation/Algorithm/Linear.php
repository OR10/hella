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

        $previous       = $start;
        $remainingSteps = $end->getFrameNumber() - $start->getFrameNumber();
        $currentShapes  = $start->getShapes();
        $endShapes      = $this->createShapeIndex($end->getShapes());

        foreach (range($start->getFrameNumber() + 1, $end->getFrameNumber() - 1) as $frameNumber) {
            $currentShapes = array_map(function($shape) use ($endShapes, $remainingSteps) {
                return $this->interpolateShape($shape, $endShapes[$shape['id']], $remainingSteps);
            }, $currentShapes);

            $current = new Model\LabeledThingInFrame();
            $current->setLabeledThingId($previous->getLabeledThingId());
            $current->setFrameNumber($frameNumber);
            $current->setClasses($previous->getClasses());
            $current->setIncomplete($previous->getIncomplete());
            $current->setShapes($currentShapes);
            $emit($current);
            $previous = $current;
            --$remainingSteps;
        }
    }

    private function createShapeIndex(array $shapes)
    {
        $indexedShapes = [];
        foreach ($shapes as $shape) {
            $indexedShapes[$shape['id']] = $shape;
        }
        return $indexedShapes;
    }

    private function interpolateShape($current, $end, $steps)
    {
        switch ($current['type']) {
        case 'rectangle':
            return [
                'id' => $current['id'],
                'type' => $current['type'],
                'topLeft' => [
                    'x' => $current['topLeft']['x'] + ($end['topLeft']['x'] - $current['topLeft']['x']) / $steps,
                    'y' => $current['topLeft']['y'] + ($end['topLeft']['y'] - $current['topLeft']['y']) / $steps,
                ],
                'bottomRight' => [
                    'x' => $current['bottomRight']['x'] + ($end['bottomRight']['x'] - $current['bottomRight']['x']) / $steps,
                    'y' => $current['bottomRight']['y'] + ($end['bottomRight']['y'] - $current['bottomRight']['y']) / $steps,
                ],
            ];
        }

        throw new \RuntimeException("Unsupported shape '{$current['type']}'");
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
