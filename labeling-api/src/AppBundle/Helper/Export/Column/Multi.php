<?php

namespace AppBundle\Helper\Export\Column;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Cell;
use AppBundle\Model;

class Multi extends Export\Column
{
    /**
     * @var Export\Column[]
     */
    private $columns;

    /**
     * @param Export\Column[] $columns
     */
    public function __construct(array $columns)
    {
        $this->columns = $columns;
    }

    public function getColumns()
    {
        return $this->columns;
    }

    public function createCell(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame,
        Model\CalibrationData $calibrationData = null
    ) {
        $cells = array_map(
            function ($column) use ($project, $video, $task, $labeledThingInFrame) {
                /** @var Export\Column $column */
                return $column->createCell(
                    $project,
                    $video,
                    $task,
                    $labeledThingInFrame
                );
            },
            $this->columns
        );

        foreach ($cells as $cell) {
            /** @var Export\Cell $cell */
            if (!($cell instanceof Cell\DefaultValue)) {
                // Utilize the first cell, which provides a value
                return $cell;
            }
        }

        // If no cell provided a value we return the first one
        return $cells[0];
    }

    public function getHeader()
    {
        $headers = array_map(
            function ($column) {
                /** @var Export\Column $column */
                return $column->getHeader();
            },
            $this->columns
        );

        $uniqueHeaders = array_unique($headers);

        if (count($uniqueHeaders) !== 1) {
            throw new \RuntimeException(
                'MultiColumn can only consist of columns with the same header name. The following were found: '
                . implode($uniqueHeaders)
            );
        }

        return $uniqueHeaders[0];
    }

    public function getDefaultValue()
    {
        $defaults = array_map(
            function ($column) {
                /** @var Export\Column $column */
                return $column->getHeader();
            },
            $this->columns
        );

        $uniqueDefaults = array_unique($defaults);

        if (count($uniqueDefaults) !== 1) {
            throw new \RuntimeException(
                'MultiColumn can only consist of columns with the default value. The following were found: '
                . implode($uniqueDefaults)
            );
        }

        return $uniqueDefaults[0];
    }
}
