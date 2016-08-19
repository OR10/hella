<?php

namespace AppBundle\Helper\Export\ColumnGroup;

use AppBundle\Helper\Export;

class Unique extends Plain
{
    /**
     * Unique constructor.
     *
     * @param Export\Column[] $columns
     */
    public function __construct(array $columns = array())
    {
        parent::__construct($columns);
        $this->columns = $this->unifyColumns($this->columns);
    }

    public function addColumn(Export\Column $column)
    {
        parent::addColumn($column);
        $this->columns = $this->unifyColumns($this->columns);
    }

    private function unifyColumns(array $columns)
    {
        $flatColumns           = $this->flattenColumns($columns);
        $headerToColumnMapping = array();

        foreach ($flatColumns as $column) {
            $header = $column->getHeader();
            if (!array_key_exists($header, $headerToColumnMapping)) {
                $headerToColumnMapping[$header] = array();
            }
            $headerToColumnMapping[$header][] = $column;
        }

        $unifiedColumns = array();
        foreach ($headerToColumnMapping as $header => $columns) {
            if (count($columns) === 1) {
                $unifiedColumns[$header] = $columns[0];
                continue;
            }

            $unifiedColumns[$header] = new Export\Column\Multi($columns);
        }

        return array_values($unifiedColumns);
    }

    private function flattenColumns(array $columns)
    {
        $flatColumns = array();
        foreach ($columns as $column) {
            if ($column instanceof Export\Column\Multi) {
                $flatColumns = array_merge($flatColumns, $this->flattenColumns($column->getColumns()));
            } else {
                $flatColumns[] = $column;
            }
        }
        return $flatColumns;
    }
}
