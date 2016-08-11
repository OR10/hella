<?php
namespace AppBundle\Helper\Export;

use AppBundle\Model;

abstract class Column
{
    /**
     * @param Model\Project             $project
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Cell
     */
    public abstract function createCell(
        Model\Project $project,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    );
}