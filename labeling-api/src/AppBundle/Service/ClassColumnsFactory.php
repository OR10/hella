<?php

namespace AppBundle\Service;

use AppBundle\Helper\Export\Column;

class ClassColumnsFactory
{
    public function create($classStructure) {
        $columns = array();
        foreach ($classStructure as $classId => $classValues) {
            $columns[] = new Column\ClassColumn($classId, $classValues);
        }

        return $columns;
    }
}