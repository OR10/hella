<?php
namespace AppBundle\Helper\Export\Column\LabeledThingInFrame;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Cell;
use AppBundle\Model;

class ClassColumn extends Export\Column
{
    /**
     * @var string
     */
    private $classId;

    /**
     * @var array
     */
    private $classValues;

    /**
     * ClassColumn constructor.
     * @param $classId
     * @param $classValues
     */
    public function __construct($classId, $classValues)
    {
        $this->classId = $classId;
        $this->classValues = $classValues;
    }

    /**
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param Model\LabeledFrame        $labeledFrame
     * @param Model\CalibrationData     $calibrationData
     *
     * @return Cell|null
     */
    public function createCell(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame = null,
        Model\LabeledFrame $labeledFrame = null,
        Model\CalibrationData $calibrationData = null
    ) {
        return new Cell\LabeledThingInFrame\ShapeClass($this->classValues, $labeledThingInFrame->getClassesWithGhostClasses());
    }

    /**
     * Return a string representation of the Header this column should have in an export
     *
     * @return string
     */
    public function getHeader()
    {
        return $this->classId;
    }

    /**
     * Provide the default value which should be used for this column if a cell is unable to provide a value for the
     * given data
     *
     * @return string
     */
    public function getDefaultValue()
    {
        return '';
    }
}
