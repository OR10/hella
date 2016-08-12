<?php
namespace AppBundle\Helper\Export\Column;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Cell;
use AppBundle\Model;

class FrameNumber extends Export\Column
{
    public function createCell(Model\Project $project, Model\Video $video, Model\LabelingTask $task, Model\LabeledThingInFrame $labeledThingInFrame)
    {
        return new Cell\FrameNumber($task, $labeledThingInFrame);
    }

    /**
     * Return a string representation of the Header this column should have in an export
     *
     * @return string
     */
    public function getHeader()
    {
        return 'FrameNumber';
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