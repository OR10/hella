<?php

namespace AnnoStationBundle\Helper\Export\Column;

use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Cell;
use AppBundle\Model;

class Polygon extends Export\Column
{
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

        $rectangleShape = $shapes[0];

        if ($rectangleShape['type'] !== 'polygon') {
            return new Cell\DefaultValue($this);
        }

        return new Cell\StringValue(
            implode(
                ';',
                array_map(
                    function ($point) {
                        return $point['x'] . ',' . $point['y'];
                    },
                    $rectangleShape['points']
                )
            )
        );
    }

    public function getHeader()
    {
        return 'Polygon';
    }

    public function getDefaultValue()
    {
        return '';
    }
}
