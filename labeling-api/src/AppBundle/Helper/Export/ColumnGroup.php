<?php
namespace AppBundle\Helper\Export;

use AppBundle\Model;

class ColumnGroup
{
    /**
     * @var Column[]
     */
    protected $columns;

    /**
     * ColumnGroup constructor.
     *
     * @param Column[] $columns
     */
    public function __construct(array $columns = array())
    {
        $this->columns = $columns;
    }

    /**
     * Add a column to the group
     *
     * @param Column $column
     */
    public function addColumn(Column $column)
    {
        $this->columns[] = $column;
    }

    /**
     * Get array of all registered Columns
     *
     * @return Column[]
     */
    public function getColumns()
    {
        return $this->columns;
    }

    /**
     * Create an array of Cells foreach registered Column using the given data
     *
     * @param Model\Project             $project
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Cell[]
     */
    public function createCells(
        Model\Project $project,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    ) {
        $cells = array();
        foreach ($this->columns as $column) {
            $cells[] = $column->createCell($project, $task, $labeledThingInFrame);
        }

        return $cells;
    }

    /**
     * Create a Row containing a cell for each column in this group based on the given data
     *
     * @param Model\Project             $project
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Row
     */
    public function createRow(
        Model\Project $project,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    ) {
        return new Row(
            $this->createCells(
                $project,
                $task,
                $labeledThingInFrame
            )
        );
    }
}