<?php
namespace AppBundle\Helper\Export;

use AppBundle\Model;

abstract class ColumnGroup
{
    /**
     * Add a column to the group
     *
     * @param Column $column
     */
    abstract public function addColumn(Column $column);

    /**
     * Add a column to the group
     *
     * @param Column[] $columns
     */
    public function addColumns(array $columns)
    {
        foreach ($columns as $column) {
            $this->addColumn($column);
        }
    }

    /**
     * Get array of all registered Columns
     *
     * @return Column[]
     */
    abstract public function getColumns();

    /**
     * Create an array of Cells foreach registered Column using the given data
     *
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Cell[]
     */
    abstract public function createCells(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    );

    /**
     * Create a Row containing a cell for each column in this group based on the given data
     *
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Row
     */
    abstract public function createRow(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    );
}
