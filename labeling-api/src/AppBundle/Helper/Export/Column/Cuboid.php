<?php

namespace AppBundle\Helper\Export\Column;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Cell;
use AppBundle\Model;
use AppBundle\Service;

class Cuboid extends Export\Column
{
    const TYPE_2D = '2d';
    const TYPE_3D = '3d';

    const AXIS_X = 'x';
    const AXIS_Y = 'y';
    const AXIS_Z = 'z';

    /**
     * @var string
     */
    private $type;

    /**
     * @var int
     */
    private $vertexIndex;

    /**
     * @var string
     */
    private $axis;

    /**
     * @var Service\DepthBuffer
     */
    private $depthBuffer;

    /**
     * @param Service\DepthBuffer $depthBuffer
     * @param string              $type
     * @param int                 $vertexIndex
     * @param string              $axis
     */
    public function __construct($depthBuffer, $type, $vertexIndex, $axis)
    {
        $this->depthBuffer = $depthBuffer;
        $this->type        = $type;
        $this->vertexIndex = $vertexIndex;
        $this->axis        = $axis;
    }

    /**
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param Model\LabeledFrame        $labeledFrame
     * @param Model\CalibrationData     $calibrationData
     *
     * @return Cell
     */
    public function createCell(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame = null,
        Model\LabeledFrame $labeledFrame = null,
        Model\CalibrationData $calibrationData = null
    ) {
        $shapes = $labeledThingInFrame->getShapes();
        if (count($shapes) === 0) {
            return new Cell\DefaultValue($this);
        }

        $cuboidRawShape = $shapes[0];

        if ($cuboidRawShape['type'] !== 'cuboid3d') {
            return new Cell\DefaultValue($this);
        }

        $cuboidShape = Model\Shapes\Cuboid3d::createFromArray($shapes[0]);

        switch ($this->type) {
            case self::TYPE_2D:
                return $this->create2dValueCell(
                    $cuboidShape,
                    $calibrationData->getCalibration(),
                    $this->vertexIndex,
                    $this->axis
                );
            case self::TYPE_3D:
                return $this->create3dValueCell($cuboidRawShape['vehicleCoordinates'], $this->vertexIndex, $this->axis);
            default:
                throw new \RuntimeException('Unknown Cuboid Column Type: ' . $this->type);
        }
    }

    /**
     * @param Model\Shapes\Cuboid3d $cuboid3d
     * @param mixed                 $calibration
     * @param int                   $index
     * @param string                $axis
     *
     * @return Cell
     */
    private function create2dValueCell(Model\Shapes\Cuboid3d $cuboid3d, $calibration, $index, $axis)
    {
        $axisToIndex = array('x' => 0, 'y' => 1, 'z' => 2);
        $cuboid2d    = $this->depthBuffer->getVertices($cuboid3d, $calibration)[0];

        return new Cell\FloatingPoint($cuboid2d[$index][$axisToIndex[$axis]], 4);
    }

    /**
     * @param array  $vertices
     * @param int    $index
     * @param string $axis
     *
     * @return Cell
     */
    private function create3dValueCell($vertices, $index, $axis)
    {
        $axisToIndex = array('x' => 0, 'y' => 1, 'z' => 2);

        return new Cell\FloatingPoint($vertices[$index][$axisToIndex[$axis]], 4);
    }

    /**
     * @return string
     */
    public function getHeader()
    {
        return sprintf(
            'vertex_%s_%d_%s',
            $this->type,
            $this->vertexIndex,
            $this->axis
        );
    }

    /**
     * @return string
     */
    public function getDefaultValue()
    {
        return '';
    }
}
