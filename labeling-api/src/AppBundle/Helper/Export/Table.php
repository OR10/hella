<?php

namespace AppBundle\Helper\Export;

class Table
{
    /**
     * @var Row[]
     */
    private $rows;

    /**
     * @var ColumnGroup
     */
    private $columnGroup;

    /**
     * Table constructor.
     *
     * @param ColumnGroup $columnGroup
     * @param Row[] $rows
     */
    public function __construct(ColumnGroup $columnGroup, array $rows = array())
    {
        $this->rows = $rows;
        $this->columnGroup = $columnGroup;
    }

    /**
     * Add a row to the table
     *
     * @param Row $row
     */
    public function addRow(Row $row)
    {
        $this->rows[] = $row;
    }

    /**
     * Retrieve all values in this table as two dimensional array
     *
     * @return string[][]
     */
    public function getValues()
    {
        $rowValues = array();
        foreach ($this->rows as $row) {
            $rowValues[] = $row->getValues();
        }

        return $rowValues;
    }

    /**
     * Generate csv representation of this whole table
     *
     * @param string $linebreak
     * @param string $delimiter
     * @param string $enclosure
     *
     * @return string
     */
    public function toCsv($linebreak = "\r\n", $delimiter = ',', $enclosure = '"')
    {
        $rowStrings = array();

        // Add header line
        $headerColumns = array();
        foreach($this->columnGroup->getColumns() as $column) {
            $headerColumns[] = $column->toCsv($enclosure);
        }
        $rowStrings[] = implode($delimiter, $headerColumns);

        // Add all rows
        foreach ($this->rows as $row) {
            $rowStrings[] = $row->toCsv($delimiter, $enclosure);
        }

        // Create full csv
        return implode($linebreak, $rowStrings);
    }
}