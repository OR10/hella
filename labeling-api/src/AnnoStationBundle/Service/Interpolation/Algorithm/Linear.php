<?php

namespace AnnoStationBundle\Service\Interpolation\Algorithm;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AnnoStationBundle\Service\Interpolation;
use AnnoStationBundle\Service;

class Linear implements Interpolation\Algorithm
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\MatrixProjection
     */
    private $matrixProjection;

    /**
     * @var Service\DepthBuffer
     */
    private $depthBuffer;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @param Facade\LabeledThing      $labeledThingFacade
     * @param Facade\Video             $videoFacade
     * @param Facade\LabelingTask      $labelingTaskFacade
     * @param Service\MatrixProjection $matrixProjection
     * @param Service\DepthBuffer      $depthBuffer
     * @param Facade\CalibrationData   $calibrationDataFacade
     */
    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\MatrixProjection $matrixProjection,
        Service\DepthBuffer $depthBuffer,
        Facade\CalibrationData $calibrationDataFacade
    ) {
        $this->labeledThingFacade    = $labeledThingFacade;
        $this->videoFacade           = $videoFacade;
        $this->labelingTaskFacade    = $labelingTaskFacade;
        $this->matrixProjection      = $matrixProjection;
        $this->depthBuffer           = $depthBuffer;
        $this->calibrationDataFacade = $calibrationDataFacade;
    }

    public function getName()
    {
        return 'linear';
    }

    public function interpolate(Model\LabeledThing $labeledThing, Model\FrameIndexRange $frameRange, callable $emit)
    {
        $task                 = $this->labelingTaskFacade->find($labeledThing->getTaskId());
        $video                = $this->videoFacade->find($task->getVideoId());
        $calibrationData      = $this->getVideoCalibration($video);
        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $frameRange->getStartFrameIndex(),
            0,
            $frameRange->getNumberOfFrames()
        );

        if (empty($labeledThingsInFrame)) {
            throw new Interpolation\Exception('Insufficient labeled things in frame');
        }

        $this->clonePrecedingLabeledThingsInFrame($frameRange->getStartFrameIndex(), $labeledThingsInFrame[0], $emit);

        while (count($labeledThingsInFrame) > 1) {
            $current = array_shift($labeledThingsInFrame);
            $emit($current);
            $this->doInterpolate($current, $labeledThingsInFrame[0], $emit, $calibrationData);
        }

        $emit($labeledThingsInFrame[0]);

        $this->cloneSubsequentLabeledThingsInFrame($labeledThingsInFrame[0], $frameRange->getEndFrameIndex(), $emit);
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
        callable $emit,
        $calibrationData
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
                function ($shape) use ($endShapes, $remainingSteps, $calibrationData) {
                    return $this->interpolateShape(
                        $shape,
                        $endShapes[$shape->getId()],
                        $remainingSteps,
                        $calibrationData
                    );
                },
                $currentShapes
            );

            $current = $previous->copy($frameIndex);
            $current->setShapesAsObjects(
                array_map(
                    function ($shape) use ($calibrationData) {
                        if (get_class($shape) === Shapes\Cuboid3d::class) {
                            return $this->applyDepthBuffer($shape, $calibrationData);
                        }

                        return $shape;
                    },
                    $currentShapes
                )
            );
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
     * @param             $calibrationData
     *
     * @return Model\Shape
     */
    private function interpolateShape(Model\Shape $current, Model\Shape $end, $steps, $calibrationData)
    {
        switch (get_class($current)) {
            case Shapes\Rectangle::class:
                return $this->interpolateRectangle($current, $end, $steps);
            case Shapes\Ellipse::class:
                return $this->interpolateEllipse($current, $end, $steps);
            case Shapes\Pedestrian::class:
                return $this->interpolatePedestrian($current, $end, $steps);
            case Shapes\Cuboid3d::class:
                return $this->interpolateCuboid3d($current, $end, $steps);
            case Shapes\Polygon::class:
                return $this->interpolatePolygon($current, $end, $steps);
            case Shapes\Polyline::class:
                return $this->interpolatePolyline($current, $end, $steps);
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
     * @param int            $steps
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
     * @param                   $steps
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

    /**
     * @param Shapes\Polygon $current
     * @param Shapes\Polygon $end
     * @param                $steps
     *
     * @return Shapes\Polygon
     */
    private function interpolatePolygon(Shapes\Polygon $current, Shapes\Polygon $end, $steps)
    {
        $currentPoints = $current->getPoints();
        $endPoints     = $end->getPoints();

        if (count($currentPoints) !== count($endPoints)) {
            throw new \RuntimeException('Failed to interpolate polygon with different points.');
        }

        $points = [];
        foreach ($currentPoints as $index => $currentPoint) {
            $points[] = [
                'x' => $currentPoint['x'] + ($endPoints[$index]['x'] - $currentPoint['x']) / $steps,
                'y' => $currentPoint['y'] + ($endPoints[$index]['y'] - $currentPoint['y']) / $steps,
            ];
        }

        return new Shapes\Polygon(
            $current->getId(),
            $points
        );
    }

    /**
     * @param Shapes\Polyline $current
     * @param Shapes\Polyline $end
     * @param                $steps
     *
     * @return Shapes\Polygon
     */
    private function interpolatePolyline(Shapes\Polyline $current, Shapes\Polyline $end, $steps)
    {
        $currentPoints = $current->getPoints();
        $endPoints     = $end->getPoints();

        if (count($currentPoints) !== count($endPoints)) {
            throw new \RuntimeException('Failed to interpolate polyline with different points.');
        }

        $points = [];
        foreach ($currentPoints as $index => $currentPoint) {
            $points[] = [
                'x' => $currentPoint['x'] + ($endPoints[$index]['x'] - $currentPoint['x']) / $steps,
                'y' => $currentPoint['y'] + ($endPoints[$index]['y'] - $currentPoint['y']) / $steps,
            ];
        }

        return new Shapes\Polyline(
            $current->getId(),
            $points
        );
    }

    /**
     * @param Shapes\Cuboid3d|Shapes\Pedestrian $current
     * @param Shapes\Cuboid3d|Shapes\Pedestrian $end
     * @param                                   $steps
     *
     * @return Shapes\Pedestrian
     */
    private function interpolateCuboid3d(Shapes\Cuboid3d $current, Shapes\Cuboid3d $end, $steps)
    {
        $newCuboid3d = [];
        $current     = $this->getCuboidFromRect($current, $end);
        $end         = $this->getCuboidFromRect($end, $current);
        foreach (range(0, 7) as $index) {
            $newCuboid3d[$index] = $this->cuboid3dCalculateNewVertex(
                $current->toArray()['vehicleCoordinates'][$index],
                $end->toArray()['vehicleCoordinates'][$index],
                $steps
            );
        }
        $cuboid = Shapes\Cuboid3d::createFromArray(
            array(
                'id'                 => $current->getId(),
                'vehicleCoordinates' => $newCuboid3d,
            )
        );

        return $cuboid;
    }

    private function getCuboidFromRect(Shapes\Cuboid3d $currentCuboid3d, Shapes\Cuboid3d $endCuboid3d)
    {
        $numberOfCurrentInvisibleVertices = array_filter(
            $currentCuboid3d->toArray()['vehicleCoordinates'],
            function ($vertex) {
                if ($vertex === null) {
                    return true;
                }

                return false;
            }
        );

        $numberOfEndInvisibleVertices = array_filter(
            $endCuboid3d->toArray()['vehicleCoordinates'],
            function ($vertex) {
                if ($vertex === null) {
                    return true;
                }

                return false;
            }
        );

        if ((count($numberOfCurrentInvisibleVertices) === 0) ||
            (count($numberOfCurrentInvisibleVertices) === 4 && count($numberOfEndInvisibleVertices) === 4)
        ) {
            return $currentCuboid3d;
        }

        if (count($numberOfCurrentInvisibleVertices) == 4) {
            $invisibleVerticesIndex = $numberOfCurrentInvisibleVertices;
        } else {
            $invisibleVerticesIndex = $numberOfEndInvisibleVertices;
        }

        switch (array_keys($invisibleVerticesIndex)) {
            case array(0, 1, 2, 3):
                $oppositeVertex = array(
                    0        => 4,
                    1        => 5,
                    2        => 6,
                    3        => 7,
                    'normal' => array(
                        array(
                            6,
                            5,
                        ),
                        array(
                            6,
                            7,
                        ),
                    ),
                );
                break;
            case array(1, 2, 5, 6):
                $oppositeVertex = array(
                    1        => 0,
                    2        => 3,
                    5        => 4,
                    6        => 7,
                    'normal' => array(
                        array(
                            7,
                            4,
                        ),
                        array(
                            7,
                            3,
                        ),
                    ),
                );
                break;
            case array(4, 5, 6, 7):
                $oppositeVertex = array(
                    4        => 0,
                    5        => 1,
                    6        => 2,
                    7        => 3,
                    'normal' => array(
                        array(
                            3,
                            0,
                        ),
                        array(
                            3,
                            2,
                        ),
                    ),
                );
                break;
            case array(0, 3, 4, 7):
                $oppositeVertex = array(
                    0        => 1,
                    3        => 2,
                    4        => 5,
                    7        => 6,
                    'normal' => array(
                        array(
                            2,
                            1,
                        ),
                        array(
                            2,
                            6,
                        ),
                    ),
                );
                break;
            case array(0, 1, 4, 5):
                $oppositeVertex = array(
                    0        => 3,
                    1        => 2,
                    4        => 7,
                    5        => 6,
                    'normal' => array(
                        array(
                            3,
                            7,
                        ),
                        array(
                            3,
                            2,
                        ),
                    ),
                );
                break;
            case array(2, 3, 6, 7):
                $oppositeVertex = array(
                    2        => 1,
                    3        => 0,
                    6        => 5,
                    7        => 4,
                    'normal' => array(
                        array(
                            1,
                            0,
                        ),
                        array(
                            1,
                            5,
                        ),
                    ),
                );
                break;
            default:
                // TODO Exception
                $oppositeVertex = array();
        }

        $plainVector1 = $currentCuboid3d->getVertices()[$oppositeVertex['normal'][0][0]]->subtract(
            $currentCuboid3d->getVertices()[$oppositeVertex['normal'][0][1]]
        );
        $plainVector2 = $currentCuboid3d->getVertices()[$oppositeVertex['normal'][1][0]]->subtract(
            $currentCuboid3d->getVertices()[$oppositeVertex['normal'][1][1]]
        );

        $normalVector   = $plainVector1->crossProduct($plainVector2);
        $distance       = $endCuboid3d->getVertices()[array_keys($oppositeVertex)[0]]->getDistanceTo(
            $endCuboid3d->getVertices()[array_values($oppositeVertex)[0]]
        );
        $distanceVector = $normalVector->divide($normalVector->getLength())->multiply($distance);

        $newVertices = array(
            'id'                 => $currentCuboid3d->getId(),
            'type'               => $currentCuboid3d->getType(),
            'vehicleCoordinates' => array(),
        );
        foreach ($oppositeVertex as $targetVertexIndex => $sourceVertexIndex) {
            if ($targetVertexIndex === 'normal') {
                continue;
            }
            $sourceVertex = $currentCuboid3d->getVertices()[$sourceVertexIndex];

            $newVertices['vehicleCoordinates'][$targetVertexIndex] = $sourceVertex->add($distanceVector)->toArray();
        }

        foreach (range(0, 7) as $index) {
            if (!isset($newVertices['vehicleCoordinates'][$index])) {
                $newVertices['vehicleCoordinates'][$index] = $currentCuboid3d->getVertices()[$index]->toArray();
            }
        }

        return Shapes\Cuboid3d::createFromArray($newVertices);
    }

    /**
     * @param $currentVertex
     * @param $endVertex
     * @param $steps
     *
     * @return array
     */
    private function cuboid3dCalculateNewVertex($currentVertex, $endVertex, $steps)
    {
        if ($currentVertex === null && $endVertex === null) {
            return null;
        }

        return [
            $currentVertex[0] + ($endVertex[0] - $currentVertex[0]) / $steps,
            $currentVertex[1] + ($endVertex[1] - $currentVertex[1]) / $steps,
            $currentVertex[2] + ($endVertex[2] - $currentVertex[2]) / $steps,
        ];
    }

    /**
     * @param Shapes\Cuboid3d $cuboid
     * @param                 $calibrationData
     *
     * @return Shapes\Cuboid3d|Shapes\Rectangle
     */
    private function applyDepthBuffer(Shapes\Cuboid3d $cuboid, $calibrationData)
    {
        $vertices = $this->depthBuffer->getVertices($cuboid, $calibrationData);

        $vertexVisibilityCount = count(
            array_filter(
                $vertices[1],
                function ($vertex) {
                    return $vertex;
                }
            )
        );

        if ($vertexVisibilityCount <= 4) {
            $newCuboid3d = [];
            foreach ($vertices[1] as $index => $visibility) {
                if ($visibility) {
                    $newCuboid3d[$index] = $cuboid->toArray()['vehicleCoordinates'][$index];
                } else {
                    $newCuboid3d[$index] = null;
                }
            }
            $cuboid = Shapes\Cuboid3d::createFromArray(
                array(
                    'id'                 => $cuboid->getId(),
                    'vehicleCoordinates' => $newCuboid3d,
                )
            );
        }

        return $cuboid;
    }

    /**
     * Get the calibration for the given video as array.
     *
     * @param Model\Video $video
     *
     * @return array|null
     */
    private function getVideoCalibration(Model\Video $video)
    {
        if ($video->getCalibrationId() === null) {
            return null;
        }

        $calibrationData = $this->calibrationDataFacade->findById($video->getCalibrationId());

        if ($calibrationData === null) {
            return null;
        }

        return $calibrationData->getCalibration();
    }
}
