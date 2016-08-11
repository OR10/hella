<?php

namespace AppBundle\Helper\Export\ColumnGroup;

use AppBundle\Helper\Export;

class Unique extends Export\ColumnGroup {
    /**
     * Unique constructor.
     *
     * @param Export\Column[] $columns
     */
    public function __construct(array $columns = array()) {
        parent::__construct($columns);
        $this->columns = $this->unifyColumns($this->columns);
    }

    public function addColumn(Export\Column $column)
    {
        parent::addColumn($column);
        $this->columns = $this->unifyColumns($this->columns);
    }

    private function unifyColumns(array $columns) {
        $uniqueColumns = array();

        foreach($columns as $column) {
            $uniqueColumns[get_class($column)] = $column;
        }

        return array_values($uniqueColumns);
    }
}