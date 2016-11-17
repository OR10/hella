<?php
namespace AppBundle\Helper\Export\ColumnGroup;

use AppBundle\Helper\Export;
use AppBundle\Model;

class Plain extends Export\ColumnGroup
{
    /**
     * @var Export\Column[]
     */
    protected $columns;

    /**
     * Export\ColumnGroup constructor.
     *
     * @param Export\Column[] $columns
     */
    public function __construct(array $columns = array())
    {
        $this->columns = $columns;
    }

    /**
     * Add a column to the group
     *
     * @param Export\Column $column
     */
    public function addColumn(Export\Column $column)
    {
        $this->columns[] = $column;
    }

    /**
     * Get array of all registered Export\Columns
     *
     * @return Export\Column[]
     */
    public function getColumns()
    {
        return $this->columns;
    }

    /**
     * Create an array of Cells foreach registered Column using the given data
     *
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param Model\LabeledFrame        $labeledFrame
     * @param Model\CalibrationData     $calibrationData
     *
     * @return Export\Cell[]
     */
    public function createCells(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame = null,
        Model\LabeledFrame $labeledFrame = null,
        Model\CalibrationData $calibrationData = null
    ) {
        $cells = array();
        foreach ($this->columns as $column) {
            $cells[] = $column->createCell($project, $video, $task, $labeledThingInFrame, $labeledFrame, $calibrationData);
        }

        return $cells;
    }

    /**
     * Create a Row containing a cell for each column in this group based on the given data
     *
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param Model\LabeledFrame        $labeledFrame
     * @param Model\CalibrationData     $calibrationData
     *
     * @return Export\Row
     */
    public function createRow(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame = null,
        Model\LabeledFrame $labeledFrame = null,
        Model\CalibrationData $calibrationData = null
    ) {
        return new Export\Row(
            $this->createCells(
                $project,
                $video,
                $task,
                $labeledThingInFrame,
                $labeledFrame,
                $calibrationData
            )
        );
    }
}
