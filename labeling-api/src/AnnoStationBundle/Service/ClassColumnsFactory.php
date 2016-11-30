<?php

namespace AnnoStationBundle\Service;

use AppBundle\Helper\Export\Column;

class ClassColumnsFactory
{
    /**
     * @param $classStructure
     *
     * @return array
     */
    public function createLabeledThingInFrameColumns($classStructure)
    {
        $columns = array();
        foreach ($classStructure as $classId => $classValues) {
            $columns[] = new Column\LabeledThingInFrame\ClassColumn($classId, $classValues);
        }

        return $columns;
    }

    /**
     * @param $classStructure
     *
     * @return array
     */
    public function createLabeledFrameColumns($classStructure)
    {
        $columns = array();
        foreach ($classStructure as $classId => $classValues) {
            $columns[] = new Column\LabeledFrame\ClassColumn($classId, $classValues);
        }

        return $columns;
    }
}
