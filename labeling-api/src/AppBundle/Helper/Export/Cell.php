<?php

namespace AppBundle\Helper\Export;

abstract class Cell {
    /**
     * Retrieve the raw value of this Cell
     *
     * @return string
     */
    abstract public function getValue();

    /**
     * Convert to proper escaped CSV value
     *
     * @param string $enclosure
     *
     * @return string
     */
    public function toCsv($enclosure = '"') {
        return sprintf(
            '%s%s%s',
            $enclosure,
            $this->escapeForEnclosure(
                $enclosure,
                $this->getValue()
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
    protected function escapeForEnclosure($enclosure, $value) {
        return addcslashes($value, $enclosure);
    }
}