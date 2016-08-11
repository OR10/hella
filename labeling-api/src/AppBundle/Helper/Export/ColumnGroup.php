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
    public abstract function addColumn(Column $column);

    /**
     * Add a column to the group
     *
     * @param Column[] $columns
     */
    public function addColumns(array $columns) {
        foreach($columns as $column) {
            $this->addColumn($column);
        }
    }

    /**
     * Get array of all registered Columns
     *
     * @return Column[]
     */
    public abstract function getColumns();

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
    public abstract function createCells(
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
    public abstract function createRow(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    );
}