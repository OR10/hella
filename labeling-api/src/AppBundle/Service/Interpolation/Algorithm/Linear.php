<?php

namespace AppBundle\Service\Interpolation\Algorithm;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
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
            $frameRange->getStartFrameIndex(),
            0,
            $frameRange->getNumberOfFrames()
        );

        if (empty($labeledThingsInFrame)) {
            throw new Interpolation\Exception('Insufficient labeled things in frame');
        }

        $this->clonePrecedingLabeledThingsInFrame(
            $frameRange->getStartFrameIndex(),
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
            $frameRange->getEndFrameIndex(),
            $emit
        );
    }

    private function clonePrecedingLabeledThingsInFrame(
        $startFrameIndex,
        Model\LabeledThingInFrame $labeledThingInFrame,
        callable $emit
    ) {
        if ($startFrameIndex >= $labeledThingInFrame->getFrameIndex()) {
            return;
        }

        foreach (range($startFrameIndex, $labeledThingInFrame->getFrameIndex() - 1) as $frameIndex) {
            $emit($labeledThingInFrame->copy($frameIndex));
        }
    }

    private function cloneSubsequentLabeledThingsInFrame(
        Model\LabeledThingInFrame $labeledThingInFrame,
        $endFrameIndex,
        callable $emit
    ) {
        if ($endFrameIndex <= $labeledThingInFrame->getFrameIndex()) {
            return;
        }

        foreach (range($labeledThingInFrame->getFrameIndex() + 1, $endFrameIndex) as $frameIndex) {
            $emit($labeledThingInFrame->copy($frameIndex));
        }
    }

    private function doInterpolate(
        Model\LabeledThingInFrame $start,
        Model\LabeledThingInFrame $end,
        callable $emit
    ) {
        if ($end->getFrameIndex() - $start->getFrameIndex() < 2) {
            // nothing to do when there is no frame in between
            return;
        }

        $previous       = $start;
        $remainingSteps = $end->getFrameIndex() - $start->getFrameIndex();
        $currentShapes  = $start->getShapesAsObjects();
        $endShapes      = $this->createShapeIndex($end->getShapesAsObjects());

        foreach (range($start->getFrameIndex() + 1, $end->getFrameIndex() - 1) as $frameIndex) {
            $currentShapes = array_map(
                function($shape) use ($endShapes, $remainingSteps) {
                    return $this->interpolateShape($shape, $endShapes[$shape->getId()], $remainingSteps);
                },
                $currentShapes
            );

            $current = $previous->copy($frameIndex);
            $current->setShapesAsObjects($currentShapes);
            $emit($current);
            $previous = $current;
            --$remainingSteps;
        }
    }

    /**
     * @param array $shapes
     *
     * @return array
     */
    private function createShapeIndex(array $shapes)
    {
        $indexedShapes = [];
        foreach ($shapes as $shape) {
            $indexedShapes[$shape->getId()] = $shape;
        }
        return $indexedShapes;
    }

    /**
     * @param Model\Shape $current
     * @param Model\Shape $end
     * @param int         $steps
     *
     * @return Model\Shape
     */
    private function interpolateShape(Model\Shape $current, Model\Shape $end, $steps)
    {
        switch (get_class($current)) {
        case Shapes\Rectangle::class:
            return $this->interpolateRectangle($current, $end, $steps);
        case Shapes\Ellipse::class:
            return $this->interpolateEllipse($current, $end, $steps);
        case Shapes\Pedestrian::class:
            return $this->interpolatePedestrian($current, $end, $steps);
        }

        throw new \RuntimeException("Unsupported shape '{$current->getType()}'");
    }

    /**
     * @param Shapes\Rectangle $current
     * @param Shapes\Rectangle $end
     * @param int              $steps
     *
     * @return Shapes\Rectangle
     */
    private function interpolateRectangle(Shapes\Rectangle $current, Shapes\Rectangle $end, $steps)
    {
        return new Shapes\Rectangle(
            $current->getId(),
            $current->getLeft() + ($end->getLeft() - $current->getLeft()) / $steps,
            $current->getTop() + ($end->getTop() - $current->getTop()) / $steps,
            $current->getRight() + ($end->getRight() - $current->getRight()) / $steps,
            $current->getBottom() + ($end->getBottom() - $current->getBottom()) / $steps
        );
    }

    /**
     * @param Shapes\Ellipse $current
     * @param Shapes\Ellipse $end
     * @param int              $steps
     *
     * @return Shapes\Ellipse
     */
    private function interpolateEllipse(Shapes\Ellipse $current, Shapes\Ellipse $end, $steps)
    {
        return new Shapes\Ellipse(
            $current->getId(),
            $current->getX() + ($end->getX() - $current->getX()) / $steps,
            $current->getY() + ($end->getY() - $current->getY()) / $steps,
            $current->getWidth() + ($end->getWidth() - $current->getWidth()) / $steps,
            $current->getHeight() + ($end->getHeight() - $current->getHeight()) / $steps
        );
    }

    /**
     * @param Shapes\Pedestrian $current
     * @param Shapes\Pedestrian $end
     * @param $steps
     *
     * @return Shapes\Pedestrian
     */
    private function interpolatePedestrian(Shapes\Pedestrian $current, Shapes\Pedestrian $end, $steps)
    {
        return new Shapes\Pedestrian(
            $current->getId(),
            $current->getTopCenterX() + ($end->getTopCenterX() - $current->getTopCenterX()) / $steps,
            $current->getTopCenterY() + ($end->getTopCenterY() - $current->getTopCenterY()) / $steps,
            $current->getBottomCenterX() + ($end->getBottomCenterX() - $current->getBottomCenterX()) / $steps,
            $current->getBottomCenterY() + ($end->getBottomCenterY() - $current->getBottomCenterY()) / $steps
        );
    }
}
