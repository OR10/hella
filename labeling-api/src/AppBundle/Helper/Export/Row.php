<?php

namespace AppBundle\Helper\Export;

class Row
{
    /**
     * @var Cell[]
     */
    private $cells;

    /**
     * Row constructor.
     *
     * @param Cell[] $cells
     */
    public function __construct(array $cells = array())
    {
        $this->cells = $cells;
    }

    /**
     * Add a Cell to this Row
     *
     * @param Cell $cell
     */
    public function addCell(Cell $cell)
    {
        $this->cells[] = $cell;
    }

    /**
     * Return array of raw values of each cell
     *
     * @return string[]
     */
    public function getValues()
    {
        $cellValues = array();
        foreach ($this->cells as $cell) {
            $cellValues[] = $cell->getValue();
        }

        return $cellValues;
    }

    /**
     * Convert to CSV line with proper delimiter and enclosure
     *
     * @param string $delimiter
     * @param string $enclosure
     *
     * @return string
     */
    public function toCsv($delimiter = ',', $enclosure = '"')
    {
        $cellStrings = array();
        foreach ($this->cells as $cell) {
            $cellStrings[] = $cell->toCsv($enclosure);
        }

        return implode($delimiter, $cellStrings);
    }
}
