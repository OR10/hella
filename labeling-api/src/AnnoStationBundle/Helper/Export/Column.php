<?php
namespace AnnoStationBundle\Helper\Export;

use AppBundle\Model;

abstract class Column
{
    /**
     * @param Model\Project             $project
     * @param Model\Video               $video
     * @param Model\LabelingTask        $task
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param Model\LabeledFrame        $labeledFrame
     *
     * @return Cell|null
     */
    abstract public function createCell(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame = null,
        Model\LabeledFrame $labeledFrame = null
    );

    /**
     * Return a string representation of the Header this column should have in an export
     *
     * @return string
     */
    abstract public function getHeader();

    /**
     * Provide the default value which should be used for this column if a cell is unable to provide a value for the
     * given data
     *
     * @return string
     */
    abstract public function getDefaultValue();

    /**
     * Generate a csv encoded version of the header value
     *
     * @param string $enclosure
     *
     * @return string
     */
    public function toCsv($enclosure = '"')
    {
        return sprintf(
            '%s%s%s',
            $enclosure,
            $this->escapeForEnclosure(
                $enclosure,
                $this->getHeader()
            ),
            $enclosure
        );
    }

    /**
     * Escape the given value based on the given enclosure
     *
     * @param string $enclosure
     * @param string $value
     *
     * @return string
     */
    protected function escapeForEnclosure($enclosure, $value)
    {
        return addcslashes($value, $enclosure);
    }
}
